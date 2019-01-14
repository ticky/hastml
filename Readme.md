# Hasty HTML, XML and SGML walker
[![npm](https://img.shields.io/npm/v/hastml.svg?maxAge=2592000)](https://www.npmjs.com/package/hastml) ![hastml](https://img.shields.io/npm/l/hastml.svg?maxAge=2592000) [![Build Status](https://travis-ci.org/ticky/hastml.svg?branch=develop)](https://travis-ci.org/ticky/hastml) [![codecov](https://codecov.io/gh/ticky/hastml/branch/develop/graph/badge.svg)](https://codecov.io/gh/ticky/hastml)

🚶🏻‍♀️ A quick and _extremely_ permissive way to process XML-like inputs.

## Installation

```shell
yarn add hastml
```

\~_or_\~

```shell
npm install --save hastml
```

## API

### `walk` (default)

The `walk` function accepts two arguments. The text, and a callback.

```javascript
import walk from 'hastml';

const myHtml = '<title>hello!</title>';

const callback = (match, tagFragment, offset, string, thisTag, stack) => {
  console.log(tagFragment, offset);
};

const output = walk(
  myHtml,
  callback
);

// Console output:
//  => '<', 0
//  => '>', 6
//  => '</', 13
//  => '>', 20
```

#### Callback function

The callback function is passed six arguments denoting the state of the walker.

- `match`: The text which will be replaced if the callback returns a string value.
- `tagFragment`: The part of the HTML tag we're currently stepping over.
  One of `<`, `>`, `</`, `/>`, `<!--` or `-->`.
- `offset`: Numeric index of the current match.
- `string`: The full HTML string which is being walked over.
- `thisTag`: An object representing the state of the current tag.
- `stack`: Array representing the path to the current tag through the document's structure.

If the callback function returns a string value, that string will replace the value of `match` in the output from `walk`. Otherwise, no change is made.

#### Tag objects

Tag objects contain data about tags being processed. What information they contain depends on where the walker is in relation to the tag it represents.

If the walker is at the start of the tag, for instance, it will only contain the `tagName`, `openIndex` and an `"open"` `state`. If the walker has reached the closing tag, it will contain more indexes, and have changed state.

The tag objects (passed to the callback function as `thisTag`, and within the `stack`) can contain the following information:

- `tagName`: The tag name, i.e. `<html>` would give `html`.
- `state`: The current state of the tag.
- `openIndex`: The index at which the tag was opened.
- `contentIndex`: The index immediately before content of the tag begins. Not included for void elements.
- `closingIndex`: The index where the closing part of the tag begins. Not included for void elements.
- `closeIndex`: The index at which the tag was closed.

The indexes can be visualised as follows:

```
openIndex       contentIndex     closeIndex
    ↓                 ↓               ↓
    <span class="text">This span</span>
                                ↑
                          closingIndex

    <img src="//plz-give.cat/random.jpg" />
    ↑                                     ↑
openIndex                           closeIndex
```

#### Tag object `state`

The `state` property of tag objects indicate where the walker is in relation to the tag. The following states are possible:

- `"open"`: The opening part of the tag has been found.
- `"content"`: The tag's content has been walked to.
- `"closing"`: The closing part of the tag has been found.

These states can be visualised as follows:

```
"open"           "content"
   ↓                 ↓
   <span class="text">This span</span>
                               ↑
                           "closing"

   <img src="//plz-give.cat/random.jpg" />
   ↑
"open"
```

Note that there is not currently a "closed" state indicating the tag has no further content or closing tag. This may be added in the future. A tag object with a populated `closeIndex` and `state` of either `"open"` or `"content"` indicates this state.
