import { ActionPanel, Action, List, Icon, getPreferenceValues } from "@raycast/api";
import { useFetch, Response } from "@raycast/utils";
import { useState } from "react";
import { URLSearchParams } from "node:url";
import { mapIconCode } from "./lib/utils";

import Preview from "./components/Preview";
import SearchResult from "./interfaces/SearchResult";
import User from "./interfaces/User";
import Breadcrumb from "./interfaces/Breadcrumb";

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const searchParams = new URLSearchParams({
    domain: "all_content",
    query: searchText.length === 0 ? "" : searchText,
    collapse: "true",
    limit: getPreferenceValues().numSearchResults,
    locale: "en",
  });
  searchParams.append("expand", "breadcrumbs");
  searchParams.append("expand", "-body");
  searchParams.append("expand", "insertUser");

  const { data, isLoading } = useFetch("https://commercequest.space/api/v2/search?" + searchParams, {
    parseResponse: parseFetchResponse,
  });

  const emptyTitle = searchText.length === 0 ? "Recent topics" : "Search results";

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search CommerceQuest forum..."
      throttle
    >
      <List.Section title={emptyTitle} subtitle={data?.length + ""}>
        {data?.map((searchResult: SearchResult) => (
          <SearchListItem key={searchResult.recordID} searchResult={searchResult} />
        ))}
      </List.Section>
    </List>
  );
}

function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
  return (
    <List.Item
      title={searchResult.name}
      keywords={[searchResult.recordType]}
      subtitle={searchResult.breadcrumbsFormatted}
      accessories={[
        { date: new Date(searchResult.dateUpdated ? searchResult.dateUpdated : searchResult.dateInserted) },
      ]}
      icon={mapIconCode(searchResult.type)}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser title="Open in Browser" url={searchResult.url} />
            {searchResult.type != "category" ? (
              <Action.Push title="Preview" target={<Preview searchResult={searchResult} />} />
            ) : null}
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

/** Parse the response from the fetch query into something we can display */
async function parseFetchResponse(response: Response) {
  const json = await response.json();

  if (!response.ok || "message" in json) {
    throw new Error("message" in json ? json.message : response.statusText);
  }

  return json.map(
    (result: {
      breadcrumbs: Breadcrumb[];
      recordID: string;
      name: string;
      recordType: string;
      type: string;
      dateUpdated: string;
      dateInserted: string;
      url: string;
      bodyPlainText: string;
      body: string;
      insertUser?: User;
    }) => {
      let breadcrumbsFormatted = "";
      const breadcrumbs: Breadcrumb[] = [];
      if (result.breadcrumbs) {
        // remove first breadcrumb, it is always "home"
        result.breadcrumbs.shift();

        // remove second one from array and add as start for breadcrumbs
        const secondBreadcrumb = result.breadcrumbs.shift();
        breadcrumbsFormatted += secondBreadcrumb?.name;
        breadcrumbs.push(secondBreadcrumb);

        // suffix remaining breadcrumbs
        result.breadcrumbs.forEach(function (breadcrumb: Breadcrumb) {
          breadcrumbsFormatted = breadcrumbsFormatted + " » " + breadcrumb.name;
          breadcrumbs.push(breadcrumb);
        });
      }

      let insertUser = null;
      if (result.insertUser) {
        insertUser = {
          name: result.insertUser.name,
          photoUrl: result.insertUser.photoUrl,
          url: result.insertUser.url,
          label: result.insertUser.label,
          title: result.insertUser.title,
        } as User;
      }

      return {
        recordID: result.recordID,
        name: result.name,
        recordType: result.recordType,
        type: result.type,
        dateUpdated: result.dateUpdated,
        dateInserted: result.dateInserted,
        url: result.url,
        breadcrumbsFormatted: breadcrumbsFormatted,
        breadcrumbs: breadcrumbs,
        bodyPlainText: result.bodyPlainText,
        body: result.body,
        insertUser: insertUser,
      } as SearchResult;
    }
  );
}
