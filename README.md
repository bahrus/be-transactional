# be-transactional

Use appHistory as a "trade blotter", providing a kind of global state unifier across components.

```html
<cotus-house be-transactional='{
    "impeachmentCount": "cotus.house.impeachmentCount",
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