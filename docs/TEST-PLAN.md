# Test plan

## Test data to include

| What to include                                          | What it proves                                |
| -------------------------------------------------------- | --------------------------------------------- |
| Titles or owners containing `.`, `[`, `]`, `*`, `+`, `?` | The search is literal, not regex              |
| Same word in different cases (`Report`, `REPORT`)        | The search is case-insensitive                |
| A match in title only, owner only, and both              | The search checks either field                |
| Several identical `startTime` values                     | The `id` tiebreaker, and stable pages         |
| More than a few pages of records (30-50)                 | Pagination, `total` and the last partial page |
| Records inserted out of date order                       | Sorting happens in the API, not in the file   |

search for something with more matches than pageSize, and assert that total is the full match count and larger than len(items).

## Tie-breaker test (identical startTime)

Create three contributions with an identical `startTime`, page through them
one item at a time, and check that each one appears exactly once.

Several contributions can share the same `startTime`. Without a second key,
the order among them isn't guaranteed to stay the same between requests.
Click from page 1 to page 2, and one of those tied items could show up on both
pages, or on neither. `id` is unique, so it breaks every tie the same way each
time.

Use ids 2 and 10 (with the same `startTime`) in this fixture, not only 1, 2 and 3. The expected order
is 2, then 10. A text sort puts `"10"` before `"2"`, so only this pair can tell a numeric sort from a
string sort.

## Search matching rules

Each test builds its own small fixture. Expected values are written out by hand.

| Fixture                                                                     | Request                     | Expected                            | What it proves                                                                                                  |
| --------------------------------------------------------------------------- | --------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| id 1, title `Alpha`, owner `Beta`                                           | `q=pha b` (`q=pha%20b`)     | 200, `total` 0                      | Title and owner are matched separately, not as one joined string                                                |
| id 1, title `Sarah's review`, owner `Sarah Lee`                             | `q=sarah`                   | 200, `total` 1, one item            | A row matching in both fields is counted once                                                                   |
| id 1, title `Reporting API`, owner `Sarah Jones`                            | `q=SARAH`                   | 200, `total` 1, item id 1           | Case-insensitive on the owner field (the brief's own example)                                                   |
| ids 1 and 2, nothing containing `zzz`                                       | `q=zzz`                     | 200, `items` empty, `total` 0       | No matches is a normal result, not a 404                                                                        |
| id 1 `f(x)`, id 2 `plain`                                                   | `q=(`                       | 200, `total` 1, item id 1           | An unbalanced `(` cannot raise a regex error (no 500)                                                           |
| id 1 `a\b`, id 2 `plain`                                                    | `q=\` (`q=%5C`)             | 200, `total` 1, item id 1           | A backslash is plain text                                                                                       |
| id 1 `2^3`, id 2 `plain`                                                    | `q=^`                       | 200, `total` 1, item id 1           | `^` does not mean "start of text" (a regex would match both)                                                    |
| id 1 `cost $5`, id 2 `plain`                                                | `q=$`                       | 200, `total` 1, item id 1           | `$` does not mean "end of text"                                                                                 |
| id 1 `a\|b`, id 2 `plain`                                                   | `q=\|`                      | 200, `total` 1, item id 1           | `\|` does not mean "or" (a regex would match both)                                                              |
| id 1 `{id}`, id 2 `plain`                                                   | `q={`                       | 200, `total` 1, item id 1           | A bare `{` is plain text                                                                                        |
| id 1 `Cut cloud costs by 20%`, id 2 `Cut costs`                             | `q=%25` (raw URL)           | 200, `total` 1, item id 1           | An encoded `%` reaches the search as `%`                                                                        |
| id 1 `Q&A tooling`, id 2 `plain`                                            | `q=%26` (raw URL)           | 200, `total` 1, item id 1           | An encoded `&` reaches the search as `&`                                                                        |
| id 1 `Issue #42`, id 2 `plain`                                              | `q=%23` (raw URL)           | 200, `total` 1, item id 1           | An encoded `#` reaches the search as `#`                                                                        |
| id 1 `C++ build`, id 2 `plain`                                              | `q=%2B` (raw URL)           | 200, `total` 1, item id 1           | An encoded `+` reaches the search as `+`                                                                        |
| ids 1 and 2                                                                 | `q=` (empty)                | 200, `total` 2                      | An empty query means no filter                                                                                  |
| ids 1 and 2                                                                 | `q=%20%20` (two spaces)     | 200, `total` 2                      | A whitespace-only query means no filter                                                                         |
| ids 1 and 2                                                                 | `q=+` (raw URL)             | 200, `total` 2                      | A bare `+` decodes to a space, so it also means no filter                                                       |
| ids 1 and 2                                                                 | `q=%09` (a tab)             | 200, `total` 2                      | A tab alone is whitespace, so it also means no filter (not only spaces)                                         |
| id 1 title `Reporting API`, id 2 title `Rapid tooling`, id 3 owner `Jo Api` | `q=%20api` (leading space)  | 200, `total` 2, items id 1 and id 3 | Any other query is not trimmed. Trimmed, it would be `api` and also match id 2 (`Rapid`), so `total` would be 3 |
| id 1 title `Reporting API`, id 2 title `Api tooling`                        | `q=api%20` (trailing space) | 200, `total` 1, item id 2           | Any other query is not trimmed. Trimmed, it would be `api` and also match id 1, so `total` would be 2           |

## Non-ASCII search and UTC output

Each test builds its own small fixture. Expected values are written out by hand.

| Fixture                                                       | Request                    | Expected                                                                                                       | What it proves                                                                               |
| ------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| id 1, title `école partnership`                               | `q=ÉCOLE`                  | 200, `total` 1, item id 1                                                                                      | `casefold` matches non-ASCII letters in any case                                             |
| id 1, title `école partnership`                               | `q=ecole`                  | 200, `total` 0                                                                                                 | Accents are not folded (`ecole` is not `école`)                                              |
| id 1, title `Straße`                                          | `q=STRASSE`                | 200, `total` 1, item id 1                                                                                      | `casefold` turns `ß` into `ss`, so `STRASSE` matches `Straße`                                |
| id 1, title `cafe` + U+0301 (decomposed `é`)                  | `q=café` (precomposed `é`) | 200, `total` 0                                                                                                 | Unicode forms are not normalised (known limitation)                                          |
| id 1 `2024-01-10T11:30:00+01:00`, id 2 `2024-01-10T10:45:00Z` | none                       | 200, items in the order id 1, id 2. Id 1 `startTime` is `2024-01-10T10:30:00Z`, id 2 is `2024-01-10T10:45:00Z` | Sorted by the real time, not by the text (as text, id 2 comes first). Output is UTC with `Z` |

## Page boundaries

| Fixture    | Request              | Expected                                          | What it proves                                                            |
| ---------- | -------------------- | ------------------------------------------------- | ------------------------------------------------------------------------- |
| 12 records | `?page=2`            | 200, 2 items, `total` 12, `page` 2, `pageSize` 10 | The last partial page. `pageSize` is the requested size, not `len(items)` |
| 12 records | `?page=3&pageSize=5` | 200, 2 items, `total` 12, `page` 3, `pageSize` 5  | The same echo rule with a different size                                  |
| 10 records | `?page=2`            | 200, `items` empty, `total` 10                    | An exact multiple: the page after the last full one is empty              |

## Query parameters

Each row is its own test. Expected values are written out by hand.

| Fixture     | Request                          | Expected                              | What it proves                                          |
| ----------- | -------------------------------- | ------------------------------------- | ------------------------------------------------------- |
| 12 records  | `?pagesize=50`                   | 200, 10 items, `pageSize` 10          | An unknown parameter is ignored (FastAPI default)       |
| 3 records   | `?page=1&page=2&pageSize=1`      | 200, `page` 2, the second record only | For a repeated parameter, the last value is used        |
| any         | `?page=`                         | 422                                   | An empty value is not treated as a missing one          |
| any         | `?page=abc`                      | 422                                   | Text that is not a number is rejected                   |
| any         | `?page=0`                        | 422                                   | The minimum for `page` is 1                             |
| 3 records   | `?page=1000000`                  | 200, `items` empty, `total` 3         | The maximum `page` is allowed, and `total` is unchanged |
| any         | `?page=1000001`                  | 422                                   | Above the maximum is rejected, not clamped              |
| any         | `?page=99999999999999999999`     | 422, not 500                          | A huge number cannot crash the API                      |
| any         | `?pageSize=` and `?pageSize=abc` | 422                                   | The same rules apply to `pageSize`                      |
| any         | `?pageSize=0`                    | 422                                   | The minimum for `pageSize` is 1                         |
| 101 records | `?pageSize=100`                  | 200, 100 items                        | The maximum `pageSize` is allowed                       |
| any         | `?pageSize=101`                  | 422                                   | Above the maximum is rejected, not clamped              |

Not tested: `page=1.0`, `page=1e2` and `page=+1`. The contract leaves these to FastAPI's default parsing.
When the API exists, try them once by hand and write the result in DECISIONS.md.

## Minimum coverage required by the brief

Planned tests for each line (names are a guide, the code comes after the Owner approves this list).
Tick when written and passing.

- [ ] Case-insensitive searching: `test_search_ignores_case` (`Report`, `REPORT`, `report`), `test_search_ignores_case_on_owner` (`SARAH`), `test_search_matches_non_ascii_case` (`ÉCOLE`, `STRASSE`)
- [ ] Literal substring matching: `test_search_matches_title_only_owner_only_and_both`, `test_search_is_a_substring_not_a_whole_word`, `test_search_does_not_match_across_title_and_owner` (`pha b`), `test_row_matching_both_fields_counts_once`, `test_no_matches_is_200_with_empty_items` (`zzz`)
- [ ] Search terms containing characters commonly used in regular expressions: `test_search_treats_regex_characters_as_text` for `.`, `*`, `[`, `]`, `+`, `?`, `(`, `\`, `^`, `$`, `|`, `{` (for example `q=.` matches `a.b` and not `axb`, and `q=(` is 200, not 500), `test_encoded_special_characters_reach_the_search` (`%25`, `%26`, `%23`, `%2B`)
- [ ] Empty and whitespace-only query (brief, Search; agreement non-negotiable): `test_empty_query_means_no_filter` (`q=`), `test_whitespace_only_query_means_no_filter` (`q=%20%20`, `q=+`, `q=%09`), `test_query_is_not_trimmed` (`q=%20api`), `test_trailing_space_in_query_is_not_trimmed` (`q=api%20`)
- [ ] Pagination validation: the Query parameters table above, and the Page boundaries table
- [ ] Total match counts: `test_total_is_counted_before_slicing` (more matches than `pageSize`, `total` is the full count and larger than `len(items)`), `test_total_is_unchanged_past_the_end`, `test_last_partial_page` and `test_exact_multiple_page_is_empty` (page boundaries), `test_page_size_echoes_the_request` (not `len(items)`)
- [ ] The real app serves the sample dataset: `test_real_app_serves_the_sample_dataset` in `tests/test_app.py` (`GET /contributions` gives `total` 40 and, sorted by `startTime` then `id`, the first page is ids 33, 31, 32, 8, 9, 1, 2, 3, 4, 5)
- [ ] Sorting correctness: `test_sorted_by_start_time_then_id`, `test_file_order_does_not_matter`, `test_tied_start_times_page_without_repeats` (the tie-breaker test), `test_id_tiebreak_is_numeric` (ids 2 and 10), the offset row in the UTC table above
