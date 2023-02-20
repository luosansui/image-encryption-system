import ControlPanel from "@/components/ControlPanel";
import Upload from "@/components/Upload";

export default function Encryption() {
  return (
    <div className="flex h-full">
      <div className="flex-1 h-fit p-2 border-2 border-gray-200 border-dashed rounded-lg">
        <Upload></Upload>
      </div>
      <div className="w-1/6 h-full min-w-fit ml-4 p-2 border-2 border-gray-200 border-dashed rounded-lg">
        {/* 控制区 */}
        <ControlPanel />
      </div>
    </div>
  );
}
