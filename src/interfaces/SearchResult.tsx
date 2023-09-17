import User from "./User";
import Breadcrumb from "./Breadcrumb";

export default interface SearchResult {
  recordID: string;
  name: string;
  recordType: string;
  type: string;
  dateUpdated: string;
  dateInserted: string;
  url: string;
  breadcrumbsFormatted: string;
  breadcrumbs: Breadcrumb[];
  bodyPlainText: string;
  body: string;
  insertUser?: User;
}
