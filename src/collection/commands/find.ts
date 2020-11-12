import { CommandCursor, WireProtocol } from "../../protocol/mod.ts";
import { Document, FindOptions } from "../../types.ts";

interface FindCursorContext {
  dbName: string;
  collectionName: string;
  protocol: WireProtocol;
  options: FindOptions;
  filter?: Document;
}

export class FindCursor<T> extends CommandCursor<T> {
  #context: FindCursorContext;

  private async excutor() {
    const { protocol, filter, dbName, collectionName, options } = this.#context;
    const { cursor } = await protocol.commandSingle(dbName, {
      find: collectionName,
      filter,
      batchSize: 1,
      noCursorTimeout: true,
      ...options,
    });
    return {
      ...cursor,
      id: cursor.id.toString(),
    };
  }

  constructor(context: FindCursorContext) {
    super(context.protocol, () => this.excutor());
    this.#context = context;
  }

  limit(limit: number): this {
    this.#context.options.limit = limit;
    return this;
  }

  skip(skip: number): this {
    this.#context.options.skip = skip;
    return this;
  }
}
