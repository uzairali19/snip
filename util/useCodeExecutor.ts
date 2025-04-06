export function executeCode(code: string): string[] {
  const logs: string[] = [];
  const customConsole = {
    log: (...args: any[]) => {
      logs.push(args.map((arg) => String(arg)).join(" "));
    },
  };

  try {
    const fn = new Function(
      "console",
      `
        try {
          ${code}
        } catch (err) {
          console.log("Runtime Error: " + err.message);
          if (err.stack) {
            const match = err.stack.match(/<anonymous>:(\\d+):(\\d+)/);
            if (match) {
              console.log("At line " + (parseInt(match[1]) - 2)); // -2 adjusts for wrapper
            }
          }
        }
      `
    );

    fn(customConsole);
  } catch (err: any) {
    logs.push("Syntax Error: " + err.message);

    if (err.stack) {
      const match = err.stack.match(/<anonymous>:(\d+):(\d+)/);
      if (match) {
        logs.push("At line " + (parseInt(match[1]) - 1));
      }
    }
  }

  return logs;
}
