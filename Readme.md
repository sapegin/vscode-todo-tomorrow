# Todo Tomorrow Visual Studio Code extension ✅

Visual Studio Code extension for highlighting `TODO`, `HACK`, `FIXME`, etc. comments.

**[Install from Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=sapegin.todo-tomorrow)**

![Todo Tomorrow Visual Studio Code extension](./images/screenshot.png)

## Features

- Very minimal and fast
- Useful defaults to cover most use cases
- Supports JavaScript, TypeScript
- Supports light and dark modes out of the box

## Settings

By default the extension highlights the following types of comments: `TODO`, `FIXME`, `@todo`, etc.

You can override the these keywords and their styles.

You can change the following options in the [Visual Studio Code setting](https://code.visualstudio.com/docs/getstarted/settings):

| Description | Setting | Default |
| --- | --- | --- |
| Groups of patterns to highlight | `todoTomorrow.patterns` | See below |

All keywords are case insensitive. See [all supported decoration options](https://code.visualstudio.com/api/references/vscode-api#DecorationRenderOptions).

Here’s how a config file would look like with default options:

```json
{
  "todoTomorrow.patterns": [
    {
      "keywords": ["todo:", "@todo:"],
      "color": "#6b676f"
    },
    {
      "keywords": [
        "fixme:",
        "fix:",
        "xxx:",
        "bug:",
        "ugly:",
        "debug:",
        "hack:",
        "@fixme:",
        "@fix:",
        "@xxx:",
        "@bug:",
        "@ugly:",
        "@debug:",
        "@hack:"
      ],
      "color": "#4c4b4e",
      "fontWeight": "bold"
    }
  ]
}
```

## Changelog

The changelog can be found on the [Changelog.md](./Changelog.md) file.

## Sponsoring

This software has been developed with lots of coffee, buy me one more cup to keep it going.

<a href="https://www.buymeacoffee.com/sapegin" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/lato-orange.png" alt="Buy Me A Coffee" height="51" width="217"></a>

## Contributing

Bug fixes are welcome, but not new features. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[Artem Sapegin](https://sapegin.me), and [contributors](https://github.com/sapegin/emoji-console-log/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
