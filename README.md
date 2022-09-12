# be-transactional

Use the Navigation API as a "trade blotter", providing a kind of global state unifier across components.

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
