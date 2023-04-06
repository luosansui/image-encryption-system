export interface ControlOptionType {
  pluginName: string;
  optionName: "encrypt" | "decrypt";
  key: string;
  message: string | null;
}
