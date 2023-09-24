import { SearchResult } from "../lib/types";
import { Action, ActionPanel, List } from "@raycast/api";
import { mapIconCode } from "../lib/utils";
import Preview from "./Preview";

export default function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
  const date = new Date(searchResult.dateUpdated ? searchResult.dateUpdated : searchResult.dateInserted);

  return (
    <List.Item
      title={searchResult.name}
      keywords={[searchResult.recordType]}
      subtitle={searchResult.breadcrumbsFormatted}
      accessories={[{ date: date, tooltip: date.toLocaleString() }]}
      icon={mapIconCode(searchResult.type)}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser url={searchResult.url} />
            {searchResult.type != "category" ? (
              <Action.Push title="Preview" target={<Preview {...searchResult} />} />
            ) : null}
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
