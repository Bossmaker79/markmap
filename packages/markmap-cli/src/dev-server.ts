import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { extname, resolve } from 'path';
import { EventEmitter } from 'events';
import { AddressInfo } from 'net';
import http from 'http';
import Koa from 'koa';
import open from 'open';
import chokidar from 'chokidar';
import { Transformer } from 'markmap-lib';
import { INode, defer, IDeferred } from 'markmap-common';
import {
  IDevelopOptions,
  ASSETS_PREFIX,
  addToolbar,
  localProvider,
  assetsDirPromise,
} from './util';

interface IFileUpdate {
  ts?: number;
  content?: string;
  line?: number;
}

interface IContentProvider {
  getUpdate: (ts: number, timeout?: number) => Promise<IFileUpdate>;
  setContent: (content: string) => void;
  setCursor: (line: number) => void;
  dispose: () => void;
}

function sequence(fn: () => Promise<void>) {
  let promise: Promise<void> | undefined;
  return () => {
    promise ||= fn().finally(() => {
      promise = undefined;
    });
    return promise;
  };
}

class BufferContentProvider implements IContentProvider {
  private deferredSet = new Set<IDeferred<IFileUpdate>>();

  private events = new EventEmitter();

  private ts = 0;

  private content = '';

  private line = -1;

  constructor() {
    this.events.on('content', () => {
      this.feed({
        ts: this.ts,
        content: this.content,
      });
    });
    this.events.on('cursor', () => {
      this.feed({
        line: this.line,
      });
    });
  }

  async getUpdate(ts: number, timeout = 10000): Promise<IFileUpdate> {
    const deferred = defer<IFileUpdate>();
    this.deferredSet.add(deferred);
    setTimeout(() => {
      this.feed({}, deferred);
    }, timeout);
    if (ts < this.ts) {
      this.feed({ ts: this.ts, content: this.content }, deferred);
    }
    return deferred.promise;
  }

  protected feed(data: IFileUpdate, deferred?: IDeferred<IFileUpdate>) {
    if (deferred) {
      deferred.resolve(data);
      this.deferredSet.delete(deferred);
    } else {
      for (const d of this.deferredSet) {
        d.resolve(data);
      }
      this.deferredSet.clear();
    }
  }

  setCursor(line: number) {
    this.line = line;
    this.events.emit('cursor');
  }

  setContent(content: string) {
    this.ts = Date.now();
    this.content = content;
    this.events.emit('content');
  }

  dispose() {
    /* noop */
  }
}

class FileSystemProvider
  extends BufferContentProvider
  implements IContentProvider
{
  private watcher: chokidar.FSWatcher;

  constructor(private fileName: string) {
    super();
    this.watcher = chokidar.watch(fileName).on(
      'all',
      sequence(() => this.update()),
    );
  }

  private async update() {
    const content = await readFile(this.fileName, 'utf8');
    this.setContent(content);
  }

  dispose() {
    super.dispose();
    this.watcher.close();
  }
}

function startServer(paddingBottom: number) {
  let ts = 0;
  let root: INode;
  let line: number;
  let offset = 0;
  const { mm, markmap } = window;
  refresh();
  function refresh() {
    fetch(`/data?ts=${ts}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.ts && res.ts > ts && res.result) {
          let frontmatter: any;
          ({ root, frontmatter, contentLineOffset: offset } = res.result);
          mm.setOptions(markmap.deriveOptions(frontmatter?.markmap));
          mm.setData(root);
          if (!ts) mm.fit();
          ts = res.ts;
          line = -1;
        }
        if (root && res.line != null && line !== res.line) {
          line = res.line;
          const active = findActiveNode();
          if (active) mm.ensureView(active, { bottom: paddingBottom });
        }
        setTimeout(refresh, 300);
      });
  }
  function findActiveNode() {
    const lineWithoutFrontmatter = line - offset;
    let best: INode | undefined;
    dfs(root);
    return best;
    function dfs(node: INode) {
      const lines = node.payload?.lines;
      if (
        lines &&
        lines[0] <= lineWithoutFrontmatter &&
        lineWithoutFrontmatter < lines[1]
      ) {
        best = node;
      }
      node.children?.forEach(dfs);
    }
  }
}

function setUpServer(
  transformer: Transformer,
  provider: IContentProvider,
  options: IDevelopOptions,
) {
  let assets = transformer.getAssets();
  if (options.toolbar) assets = addToolbar(transformer.urlBuilder, assets);
  const html = `${transformer.fillTemplate(
    null,
    assets,
  )}<script>(${startServer.toString()})(${options.toolbar ? 60 : 0})</script>`;

  const app = new Koa();
  app.use(async (ctx, next) => {
    if (ctx.path === '/') {
      ctx.body = html;
    } else if (ctx.path === '/data') {
      const update = await provider.getUpdate(ctx.query.ts);
      const result =
        update.content == null
          ? null
          : transformer.transform(update.content || '');
      ctx.body = { ts: update.ts, result, line: update.line };
    } else {
      if (ctx.path.startsWith(ASSETS_PREFIX)) {
        const relpath = ctx.path.slice(ASSETS_PREFIX.length);
        const assetsDir = await assetsDirPromise;
        try {
          const realpath = resolve(assetsDir, relpath);
          ctx.type = extname(relpath);
          ctx.body = createReadStream(realpath);
          return;
        } catch (err) {
          console.error(err);
        }
      }
      await next();
    }
  });

  const handle = app.callback() as http.RequestListener;
  const server = http.createServer(handle);
  server.listen(() => {
    const { port } = server.address() as AddressInfo;
    console.info(`Listening at http://localhost:${port}`);
    if (options.open) open(`http://localhost:${port}`);
  });
  let closing: Promise<void>;
  return {
    provider,
    close() {
      if (!closing) {
        closing = new Promise((resolve, reject) =>
          server.close((err?: Error) => {
            if (err) reject(err);
            else resolve();
          }),
        );
      }
      return closing;
    },
  };
}

export async function develop(
  fileName: string | undefined,
  options: IDevelopOptions,
) {
  const transformer = new Transformer();
  transformer.urlBuilder.setProvider('local', localProvider);
  transformer.urlBuilder.provider = 'local';
  const provider = fileName
    ? new FileSystemProvider(fileName)
    : new BufferContentProvider();
  return setUpServer(transformer, provider, options);
}
