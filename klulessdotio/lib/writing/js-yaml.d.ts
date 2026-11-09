declare module "js-yaml" {
  const yaml: { safeLoad(source: string, options: { schema: unknown }): object; CORE_SCHEMA: unknown }
  export default yaml
}
