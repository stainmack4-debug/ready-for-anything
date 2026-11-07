import catalog from "./funaab-opencourseware.json";

export type OpenCoursewareItem = {
  title: string;
  url: string;
  source: string;
};

export const funaabOpenCourseware = catalog as OpenCoursewareItem[];
