# be-transactional

Use the Navigation API as a "trade blotter", providing a kind of global state unifier across components.

```html
<cotus-house be-transactional='{
    "impeachmentCount:onSet": "cotus.house.impeachmentCount"
}'cotus.house.impeachmentCount></cotus-house>
```

is shorthand for:

```html
<cotus-house be-transactional='{
    "impeachmentCount:onSet": {
        "path": "cotus.house.impeachmentCount",
        "navType": "reload", //|'push'|'replace'|'traverse'
    }
}'></cotus-house>

...
<cotus-potus be-observant='{
    "impeachmentCount": {
        "observeAppHistory": "cotus.house.impeachmentCount",
        "linearTransform":{
            "m": 1,
            "b": -4
        }
    }
}'></cotus-potus>
```