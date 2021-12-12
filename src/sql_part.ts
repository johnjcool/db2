import { clone } from 'lodash';

export class SqlPartDef {
  type: string;
  style: string;
  label: string;
  params: any[];
  defaultParams: any[];
  wrapOpen: string;
  wrapClose: string;
  separator: string;

  constructor(options: any) {
    this.type = options.type;
    if (options.label) {
      this.label = options.label;
    } else {
      this.label = this.type[0].toUpperCase() + this.type.substring(1) + ':';
    }
    this.style = options.style;
    if (this.style === 'function') {
      this.wrapOpen = '(';
      this.wrapClose = ')';
      this.separator = ', ';
    } else {
      this.wrapOpen = ' ';
      this.wrapClose = ' ';
      this.separator = ' ';
    }
    this.params = options.params;
    this.defaultParams = options.defaultParams;
  }
}

export class SqlPart {
  part: any;
  def: SqlPartDef;
  params: any[];
  label: string;
  name: string;
  datatype: string;

  constructor(part: any, def: any) {
    this.part = part;
    this.def = def;
    if (!this.def) {
      throw { message: 'Could not find sql part ' + part.type };
    }

    this.datatype = part.datatype;

    if (part.name) {
      this.name = part.name;
      this.label = def.label + ' ' + part.name;
    } else {
      this.name = '';
      this.label = def.label;
    }

    part.params = part.params || clone(this.def.defaultParams);
    this.params = part.params;
  }

  updateParam(strValue: string, index: number) {
    // handle optional parameters
    if (strValue === '' && this.def.params[index].optional) {
      this.params.splice(index, 1);
    } else {
      this.params[index] = strValue;
    }

    this.part.params = this.params;
  }
}

const index: any[] = [];

export function createPart(part: any): any {
  const def = index[part.type];
  if (!def) {
    return null;
  }

  return new SqlPart(part, def);
}

function register(options: any) {
  index[options.type] = new SqlPartDef(options);
}

register({
  type: 'column',
  style: 'label',
  params: [{ type: 'column', dynamicLookup: true }],
  defaultParams: ['value'],
});

register({
  type: 'expression',
  style: 'expression',
  label: 'Expr:',
  params: [
    { name: 'left', type: 'string', dynamicLookup: true },
    { name: 'op', type: 'string', dynamicLookup: true },
    { name: 'right', type: 'string', dynamicLookup: true },
  ],
  defaultParams: ['value', '=', 'value'],
});

register({
  type: 'macro',
  style: 'label',
  label: 'Macro:',
  params: [],
  defaultParams: [],
});

register({
  type: 'aggregate',
  style: 'label',
  params: [
    {
      name: 'name',
      type: 'string',
      options: ['avg', 'count', 'min', 'max', 'sum', 'stddev', 'variance'],
    },
  ],
  defaultParams: ['avg'],
});

register({
  type: 'percentile',
  label: 'Aggregate:',
  style: 'label',
  params: [
    {
      name: 'name',
      type: 'string',
      options: ['percentile_cont', 'percentile_disc'],
    },
    {
      name: 'fraction',
      type: 'number',
      options: ['0.5', '0.75', '0.9', '0.95', '0.99'],
    },
  ],
  defaultParams: ['percentile_cont', '0.95'],
});

register({
  type: 'alias',
  style: 'label',
  params: [{ name: 'name', type: 'string', quote: 'double' }],
  defaultParams: ['alias'],
});

register({
  type: 'time',
  style: 'function',
  label: 'time',
  params: [
    {
      name: 'interval',
      type: 'interval',
      options: ['$__interval', '1s', '10s', '1m', '5m', '10m', '15m', '1h'],
    },
    {
      name: 'fill',
      type: 'string',
      options: ['none', 'NULL', 'previous', '0'],
    },
  ],
  defaultParams: ['$__interval', 'none'],
});

register({
  type: 'window',
  style: 'label',
  params: [
    {
      name: 'function',
      type: 'string',
      options: ['delta', 'increase', 'rate', 'sum'],
    },
  ],
  defaultParams: ['increase'],
});

register({
  type: 'moving_window',
  style: 'label',
  label: 'Moving Window:',
  params: [
    {
      name: 'function',
      type: 'string',
      options: ['avg'],
    },
    {
      name: 'window_size',
      type: 'number',
      options: ['3', '5', '7', '10', '20'],
    },
  ],
  defaultParams: ['avg', '5'],
});
