/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useMemo} from 'react';
import {
  useThemeConfig,
  useTOCHighlight,
  useFilteredAndTreeifiedTOC,
} from '@docusaurus/theme-common'; // Recursive component rendering the toc tree

/* eslint-disable jsx-a11y/control-has-associated-label */

function TOCItemList({toc, className, linkClassName, isChild}) {
  if (!toc.length) {
    return null;
  }

  return (
    <ul className={isChild ? undefined : className}>
      {toc.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            className={linkClassName ?? undefined} // Developer provided the HTML, so assume it's safe.
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: heading.value,
            }}
          />
          <TOCItemList
            isChild
            toc={heading.children}
            className={className}
            linkClassName={linkClassName}
          />
        </li>
      ))}
    </ul>
  );
}

// find descendent with searchId as id using DFS and return its children
function findTOC(tocTree, searchId) {
  for(let i = 0; i < tocTree.length; i++ ) {
    let tocTreeNode = tocTree[i];

    if (tocTreeNode.id === searchId) {
      return tocTreeNode.children;
    }

    let searchResult = findTOC(tocTreeNode.children, searchId);
    if (searchResult) {
      return searchResult;
    }
  }

  return null;
}

export default function TOCItems({
  toc,
  className = 'table-of-contents table-of-contents__left-border',
  linkClassName = 'table-of-contents__link',
  linkActiveClassName = undefined,
  minHeadingLevel: minHeadingLevelOption,
  maxHeadingLevel: maxHeadingLevelOption,
  ...props
}) {
  const themeConfig = useThemeConfig();
  const minHeadingLevel =
    minHeadingLevelOption ?? themeConfig.tableOfContents.minHeadingLevel;
  const maxHeadingLevel =
    maxHeadingLevelOption ?? themeConfig.tableOfContents.maxHeadingLevel;
  // In the event of re-swizzling, make sure to change the tocTree declaration above to `let`
  let tocTree = useFilteredAndTreeifiedTOC({
    toc,
    minHeadingLevel,
    maxHeadingLevel,
  });

  // Customization START
  // In the event of re-swizzling, need to copy below snippet and add back in the newly swizzled TOCItems component
  // This block should always come after the `tocTree` variable which holds results from `useFilteredAndTreeifiedTOC`
  // make sure to change the tocTree declaration above to `let`
  if (typeof props.filterTOC === "function") {
    tocTree = props.filterTOC(tocTree);
  }

  if (typeof props.filterTOC === "string") {
    tocTree = findTOC(tocTree, props.filterTOC)
  }

  if(!tocTree) {
    throw new Error('TOCInline error: filter gives no result');
  }
  // Customization END

  const tocHighlightConfig = useMemo(() => {
    if (linkClassName && linkActiveClassName) {
      return {
        linkClassName,
        linkActiveClassName,
        minHeadingLevel,
        maxHeadingLevel,
      };
    }

    return undefined;
  }, [linkClassName, linkActiveClassName, minHeadingLevel, maxHeadingLevel]);
  useTOCHighlight(tocHighlightConfig);
  return (
    <TOCItemList
      toc={tocTree}
      className={className}
      linkClassName={linkClassName}
      {...props}
    />
  );
}
