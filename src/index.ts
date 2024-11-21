/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

type WindowObject = Window & {
  cordova: {
    plugins: Record<string, Record<string, (...args: any[]) => any>>;
  };
  Capacitor: {
    Plugins: Record<string, Record<string, (...args: any[]) => Promise<any>>>;
  };
  CapacitorUtils: {
    Synapse: Record<
      string,
      (params: any, onSuccess: (result: any) => void, onError: (error: any) => void) => void
    >;
  };
};

function createSynapseCapacitorProxy(window: WindowObject): void {
  window.CapacitorUtils.Synapse = new Proxy(
    {},
    {
      get(_target, pluginName: string) {
        return new Proxy({}, {
          get(_target, methodName: string) {
            return (params: any, onSuccess: (result: any) => void, onError: (error: any) => void) => {
              const capacitorPlugin = window.Capacitor.Plugins[pluginName];
              if (capacitorPlugin === undefined) {
                onError(new Error(`Capacitor plugin ${pluginName} not found`));
                return;
              }
              if (typeof capacitorPlugin[methodName] !== 'function') {
                onError(new Error(`Method ${methodName} not found in Capacitor plugin ${pluginName}`));
                return;
              }
              (async () => {
                try {
                  const resulting = await capacitorPlugin[methodName](params);
                  onSuccess(resulting);
                } catch (error) {
                  onError(error);
                }
              })();
            };
          },
        });
      },
    },
  );
}

function createSynapseCordovaProxy(window: WindowObject): void {
  window.CapacitorUtils.Synapse = new Proxy(
    {},
    {
      get(_target, property) {
        return window.cordova['plugins'][property as string];
      },
    },
  );
}

/**
 * Example use: 
 *    window.CapacitorUtils.Synapse.DemoPlugin.ping(
 *      {value: "hello"}, 
 *      (val) => {console.log(val)}, 
 *      (err) => {console.error(err)}
 *    );
 */
export function exposeSynapse(): void {
  (window as any).CapacitorUtils = (window as any).CapacitorUtils || {};
  if ((window as any).Capacitor !== undefined) {
    createSynapseCapacitorProxy(window as any);
  } else if ((window as any).cordova !== undefined) {
    createSynapseCordovaProxy(window as any);
  }
}
