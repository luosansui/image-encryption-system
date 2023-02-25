import { Plugin, PluginModule } from "./type";

class PluginService {
  private plugins: Plugin[] = [];
  private loadedModules: Record<string, PluginModule> = {};

  public async loadPlugin(plugin: Plugin): Promise<void> {
    if (this.loadedModules[plugin.name]) {
      throw new Error(`Plugin ${plugin.name} has already been loaded`);
    }

    const modulePath = plugin.path;
    const module = await import(/* @vite-ignore */ modulePath);
    //按合适的顺序插入插件
    const index = this.plugins.findIndex(
      (obj) => obj.name.localeCompare(plugin.name) > 0
    );
    if (index === -1) {
      this.plugins.push(plugin);
    } else {
      this.plugins.splice(index, 0, plugin);
    }
    this.loadedModules[plugin.name] = module;
  }

  public unloadPlugin(pluginName: string): void {
    this.plugins = this.plugins.filter((plugin) => plugin.name !== pluginName);
    delete this.loadedModules[pluginName];
  }

  public getPlugins(): Plugin[] {
    return this.plugins;
  }

  public forEachPlugin(callback: (plugin: Plugin) => void): void {
    this.plugins.forEach(callback);
  }

  public getPluginInstance<T>(pluginName: string): T {
    const module = this.loadedModules[pluginName];
    if (!module) {
      throw new Error(`Plugin ${pluginName} has not been loaded`);
    }

    const plugin = module;
    if (!plugin) {
      throw new Error(`Invalid plugin ${pluginName}`);
    }

    return plugin as T;
  }
}
export default PluginService;
