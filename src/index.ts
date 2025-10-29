import { PluginDefinition, TemplateFunctionArg } from "@yaakapp/api";
import dayjsBase from "dayjs/esm";
import utc from "dayjs/esm/plugin/utc";
import relativeTime from "dayjs/esm/plugin/relativeTime";
import advancedFormat from "dayjs/esm/plugin/advancedFormat";
import duration from "dayjs/esm/plugin/duration";
import localizedFormat from "dayjs/esm/plugin/localizedFormat";

dayjsBase.extend(localizedFormat);
dayjsBase.extend(duration);
dayjsBase.extend(relativeTime);
dayjsBase.extend(utc);
dayjsBase.extend(advancedFormat);

const modules = {
  dayjs: {
    callback: (dateTime?: string) => dayjsBase(dateTime).toJSON(),
    args: [
      {
        type: "text",
        name: "dateTime",
        label: "Base Date/Time (optional)",
        placeholder: "Leave empty for current date/time",
      },
    ] as TemplateFunctionArg[],
  },
  format: {
    callback: (dateTime: string, format: string) =>
      dayjsBase(dateTime).isValid()
        ? dayjsBase(dateTime).format(format)
        : dayjsBase().format(format),
    args: [
      {
        type: "text",
        name: "dateTime",
        label: "Base Date/Time",
        placeholder: "Leave empty for current date/time",
      },
      {
        type: "text",
        name: "format",
        label: "Format (optional)",
        placeholder: "YYYY-MM-DD HH:mm:ss",
      },
    ] as TemplateFunctionArg[],
  },
  utc: {
    callback: (dateTime: string, keepLocalTime: boolean, format: string) =>
      dayjsBase(dateTime).utc(keepLocalTime).format(format),
    args: [
      {
        type: "text",
        name: "dateTime",
      },
      {
        type: "checkbox",
        name: "keepLocalTime",
      },
      {
        type: "text",
        name: "format",
        label: "Format (optional)",
        placeholder: "Leave empty for default format",
      },
    ] as TemplateFunctionArg[],
  },
  from: {
    callback: (dateTime: string, fromDate: string) =>
      dayjsBase(dateTime).from(fromDate),
    args: [
      {
        type: "text",
        name: "dateTime",
        label: "Date/Time",
        placeholder: "Leave empty for current date/time",
      },
      {
        type: "text",
        name: "fromDate",
        label: "From Date/Time",
        placeholder: "Leave empty for current date/time",
      },
    ] as TemplateFunctionArg[],
  },
  toISOString: {
    callback: (dateTime: string) => dayjsBase(dateTime).toISOString(),
    args: [
      {
        type: "text",
        name: "dateTime",
        label: "Date/Time",
        placeholder: "Leave empty for current date/time",
      },
    ] as TemplateFunctionArg[],
  },
} as const satisfies Record<
  string,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (...args: any[]) => string;
    args: TemplateFunctionArg[];
  }
>;

export const plugin: PluginDefinition = {
  templateFunctions: Object.entries(modules).map(([name, module]) => {
    return {
      name: name === "dayjs" ? "dayjs" : `dayjs.${name}`,
      args: module.args,
      async onRender(_ctx, _args) {
        const args = Object.values(_args.values);

        const result = (module.callback as (...args: unknown[]) => string)(
          ...args
        );
        await _ctx.toast.show({
          message: `debug: ${args.map((arg) => arg).join(", ")} -> ${result}`,
        });

        if (typeof result !== "string") {
          return JSON.stringify(result);
        }
        return Promise.resolve(result);
      },
    };
  }),
};
