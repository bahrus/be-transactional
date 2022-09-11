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
        "valueFromTarget": "impeachmentCount",
    }
}'></cotus-house>

...
<cotus-potus be-current='{
    "with": "cotus.house.impeachmentCount",
    "set": "impeachmentCount"
}'></cotus-potus>
```