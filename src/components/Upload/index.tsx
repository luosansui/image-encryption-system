import React, { useState } from "react";
import Dropzone from "react-dropzone";

const MultiImageUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles((prevState) => [...prevState, ...acceptedFiles]);
  };

  const handleRemove = (file: File) => {
    setFiles((prevState) => prevState.filter((f) => f !== file));
  };

  return (
    <div>
      <Dropzone onDrop={handleDrop}>
        {({ getRootProps, getInputProps }) => (
          <div className="border-2 border-dashed border-gray-400 rounded-md p-4">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag and drop some files here, or click to select files</p>
            </div>
          </div>
        )}
      </Dropzone>
      <div className="flex flex-wrap mt-4">
        {files.map((file, index) => (
          <div key={file.name} className="m-2 relative">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-32 h-32 object-cover rounded"
            />
            <button
              className="text-black absolute -top-2 -right-2"
              onClick={() => handleRemove(file)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M13.414 6.586a2 2 0 112.828 2.828L12.828 10l3.414 3.414a2 2 0 11-2.828 2.828L10 12.828l-3.414 3.414a2 2 0 11-2.828-2.828L7.172 10 3.758 6.586a2 2 0 112.828-2.828L10 7.172l3.414-3.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiImageUpload;
