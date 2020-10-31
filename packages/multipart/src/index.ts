import { definePlugin } from 'villus';
import { extractFiles } from 'extract-files';

export function multipart() {
  return definePlugin(function multipartPlugin(context) {
    const { operation, opContext } = context;
    const { files, clone: variables } = extractFiles({ ...((operation?.variables as Record<string, any>) || {}) });

    if (!files.size) {
      return;
    }

    // cleanup content-type
    if ((opContext.headers as any)['content-type'] === 'application/json') {
      delete (opContext.headers as any)['content-type'];
    }

    const body = new FormData();
    body.append('operations', JSON.stringify({ query: operation.query, variables }));

    const map: Record<number, string[]> = {};
    let i = 0;
    files.forEach(paths => {
      map[++i] = paths.map(path => `variables.${path}`);
    });

    body.append('map', JSON.stringify(map));

    i = 0;
    files.forEach((_, file) => {
      body.append(`${++i}`, file as Blob, (file as File).name);
    });

    opContext.body = body;
  });
}
