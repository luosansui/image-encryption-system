import React, { Fragment, useState } from "react";
import { NavLink } from "react-router-dom";
import routes, { CustomRouteObject } from "@/routes";

const MenuNavLink: React.FC<{ route: CustomRouteObject; zIndex?: number }> = ({
  route,
  zIndex = 0,
}) => {
  const hasChildren = route.children && route.children.length > 0;
  const [expanded, setExpanded] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasChildren) {
      event.preventDefault();
    }
    setExpanded(!expanded);
  };

  return (
    <li className="mb-2">
      <NavLink
        onClick={handleClick}
        end
        to={route.path as string}
        className={({ isActive }) =>
          `flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-md ${
            hasChildren ? "cursor-pointer" : ""
          } ${isActive ? "!bg-white shadow-md" : ""}`
        }
      >
        <span className={`inline-block ml-${4 * zIndex} mr-2`}>
          {route.name}
        </span>
        {hasChildren && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-transform ${
              expanded ? "rotate-180" : "rotate-0"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </NavLink>
      {hasChildren && (
        <ul
          className={`transition-all overflow-hidden ${
            expanded ? "max-h-[1000px]" : "max-h-0"
          }`}
        >
          {route.children?.map((childRoute: CustomRouteObject, index) => (
            <MenuNavLink key={index} route={childRoute} zIndex={zIndex + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

const Sidebar: React.FC = () => {
  return (
    <Fragment>
      <button
        className="md:hidden w-fit p-2 mt-2 ml-3 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        type="button"
        data-drawer-target="drawer-navigation"
        data-drawer-show="drawer-navigation"
        aria-controls="drawer-navigation"
      >
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>

      <div
        id="drawer-navigation"
        className="max-w-full select-none fixed top-0 left-0 z-40 w-64 h-screen p-4 overflow-y-auto transition-transform -translate-x-full md:translate-x-0 bg-gray-100 dark:bg-gray-800"
        aria-labelledby="drawer-navigation-label"
      >
        <div className="flex justify-between items-center md:hidden">
          <div className="font-semibold text-gray-600 text-lg">
            图像加密系统
          </div>
          <button
            type="button"
            data-drawer-hide="drawer-navigation"
            aria-controls="drawer-navigation"
            className="text-gray-500 bg-transparent hover:bg-gray-200  rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              ></path>
            </svg>
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <div className="pt-2 md:pt-0 bg-gray-100">
          <ul className="">
            {routes?.map(
              (route, index) =>
                route.name && <MenuNavLink key={index} route={route} />
            )}
          </ul>
        </div>
      </div>
    </Fragment>
  );
};

export default Sidebar;
