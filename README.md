# be-transactional

Use the Navigation API as a "trade blotter", providing a kind of global state unifier across components.

<a href="https://nodei.co/npm/be-transactional/"><img src="https://nodei.co/npm/be-transactional.png"></a>

Size of package, including custom element behavior framework (be-decorated):

[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-transactional?style=for-the-badge)](https://bundlephobia.com/result?p=be-transactional)

Size of new code in this package:

<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-transactional?compression=gzip">

```html
<cotus-house be-transactional='{
    "impeachmentCount:onSet": "cotus.house.impeachmentCount"
}'></cotus-house>

...
<cotus-potus be-current='{
    "impeachmentCount": "cotus.house.impeachmentCount"
}'></cotus-potus>
```

is shorthand for:

```html
<cotus-house be-transactional='{
    "impeachmentCount:onSet": {
        "path": "cotus.house.impeachmentCount",
        "valueFromTarget": "impeachmentCount",
    }
}'></cotus-house>

...
<cotus-potus be-current='{
    "impeachmentCount": "cotus.house.impeachmentCount"
}'></cotus-potus>
```

[polyfill](https://www.npmjs.com/package/navigation-polyfill)
[guide](https://developer.chrome.com/docs/web-platform/navigation-api)
