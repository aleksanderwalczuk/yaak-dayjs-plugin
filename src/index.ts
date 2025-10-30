import { PluginDefinition, TemplateFunctionArg } from "@yaakapp/api";
import dayjsBase from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjsBase.extend(localizedFormat);
dayjsBase.extend(duration);
dayjsBase.extend(relativeTime);
dayjsBase.extend(utc);
dayjsBase.extend(advancedFormat);

function processTextInput(dateTime?: string) {
  return typeof dateTime === "string" ? dateTime : undefined;
}

function createValidatedCallback<T extends unknown[], R>(
  callback: (...args: T) => R
) {
  return (...args: T): { result: R; message: string | null } => {
    const dateTime = args[0] as string | undefined;
    if (dateTime !== undefined && dateTime !== null && dateTime !== "") {
      const dayjsObj = dayjsBase(processTextInput(dateTime));
      if (!dayjsObj.isValid()) {
        try {
          return {
            result: callback(...args),
            message: "Invalid Date",
          };
        } catch {
          return {
            result: "Invalid Date" as R,
            message: "Invalid Date",
          };
        }
      }
    }

    return {
      result: callback(...args),
      message: null,
    };
  };
}

const modules = {
  dayjs: {
    callback: createValidatedCallback(
      (dateTime?: string, toUTCTime?: boolean) =>
        toUTCTime
          ? dayjsBase(processTextInput(dateTime)).toJSON()
          : dayjsBase(processTextInput(dateTime)).format(
              "YYYY-MM-DDTHH:mm:ss.SSSZ"
            )
    ),
    args: [
      {
        type: "text",
        name: "dateTime",
        label: "Base Date/Time (optional)",
        placeholder: "Leave empty for current date/time",
      },
      {
        type: "checkbox",
        name: "toUTCTime",
        label: "Convert to UTC",
        placeholder: "Leave empty for local time",
      },
    ] as TemplateFunctionArg[],
  },
  format: {
    callback: createValidatedCallback((dateTime: string, format: string) =>
      dayjsBase(processTextInput(dateTime)).format(format)
    ),
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
  from: {
    callback: createValidatedCallback((dateTime: string, fromDate: string) =>
      dayjsBase(processTextInput(dateTime)).from(processTextInput(fromDate))
    ),
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
    callback: createValidatedCallback((dateTime: string) =>
      dayjsBase(processTextInput(dateTime)).toISOString()
    ),
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
    callback: (...args: any[]) => { result: string; message: string | null };
    args: TemplateFunctionArg[];
  }
>;

export const plugin: PluginDefinition = {
  templateFunctions: Object.entries(modules).map(([name, module]) => {
    return {
      name: name === "dayjs" ? "dayjs" : `dayjs.${name}`,
      args: module.args,
      async onRender(_ctx, _args) {
        const args = module.args.map(
          (arg) => _args.values[(arg as { name: string }).name]
        );

        const response = (
          module.callback as (...args: unknown[]) => {
            result: string;
            message: string | null;
          }
        )(...args);

        if (response.message) {
          void _ctx.toast.show({
            message: response.message,
            icon: "alert_triangle",
          });
        }

        if (typeof response.result !== "string") {
          return JSON.stringify(response.result);
        }
        return Promise.resolve(response.result);
      },
    };
  }),
};
