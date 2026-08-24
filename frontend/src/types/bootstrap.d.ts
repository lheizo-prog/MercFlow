declare module "bootstrap" {
  interface CollapseOptions {
    toggle?: boolean;
  }

  class Collapse {
    constructor(element: Element, options?: CollapseOptions);
    static getOrCreateInstance(
      element: Element,
      options?: CollapseOptions,
    ): Collapse;
    show(): void;
    hide(): void;
  }

  export { Collapse };
}
