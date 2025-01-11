# addy.io / AnonAddy for Thunderbird

[addons.thunderbird.net][atn] |
[GitHub][gh] |
[Bug reports and suggestions][issues] |
[E-mail support][support]

## Administrivia

Author and maintainer: Jonathan Kamens

Copyright &copy; 2025 Jonathan Kamens. Released under the terms of the
Mozilla Public License, v. 2.0. Full text of the MPL can be found in
the file [LICENSE.txt](LICENSE.txt).

You can [contribute](#donate) to ongoing development and maintenance
of this add-on if you find it useful.

This extension and its author are not affiliated with the maintainer
of the addy.io service. It was developed and is supported
independently.

## Details about the extension

This repository contains the source code for "addy.io / AnonAddy for
Thunderbird", a Thunderbird extension which integrates
[addy.io][addyio] or any self-hosted [AnonAddy][anonaddy] server into
the Thunderbird message composition window.

This extension adds a button to the composition window. When you click
that button, it examines the recipient addresses for the message you
are composing, tries to identify which AnonAddy aliases correspond to
those recipients, and pops up a window allowing you to select from the
aliases it has identified and/or create new aliases for one or more of
the recipients. When everything looks correct, you click a button in
the pop-up window, and the extension transforms the recipient
addresses you specified into their corresponding outbound Addy email
addresses. As a result, the message you are sending is routed through
the Addy server, and the recipient sees your Addy alias as your return
address instead of your real address.

For this to work, you need to include in the "description" field of
your Addy aliases the target email addresses and/or domains they're
intended to be used for. For example, if you create an alias for
corresponding with people at "example.com", then "example.com" appears
in the description of the created alias. Similarly, if you create an
alias that you specifically want to use for exchanging email with
"bob@example.com", then you need to include that address somewhere in
the description.

When you first install the extension, its options page opens
automatically. Fill in your addy.io or AnonAddy API key (see
[here][apikey] for addy.io) and save the options to enable the
extension. Optionally, specify the base URL of a self-hosted AnonAddy
server to use instead of addy.io. If you specify a self-hosted server
then when you save the options you are prompted to grant permission
for the extension to make API calls to that server.

Once you've filled in the correct API key, the "Addy" button in the
compose window toolbar will work. Otherwise it just generates errors
in the error console.

## <a id="donate"/>Donations

It takes a lot of time and effort to create and maintain Thunderbird
extensions, and support is always welcome and appreciated. You can
donate through [Liberapay][liberapay] or [Patreon][patreon] for
recurring donations, or [Paypal][paypal] or [Venmo][venmo] for
one-time donations.

[atn]: https://addons.thunderbird.net/thunderbird/addon/addy-io-anonaddy
[gh]: https://github.com/jikamens/AnonAddyTB
[issues]: https://github.com/jikamens/AnonAddyTB/issues
[support]: mailto:jik@kamens.us
[addyio]: https://addy.io/
[anonaddy]: https://github.com/anonaddy/AnonAddy
[apikey]: https://app.addy.io/settings/api
[liberapay]: https://liberapay.com/jik
[patreon]: https://www.patreon.com/jikseclecticofferings
[paypal]: https://paypal.me/JonathanKamens
[venmo]: https://venmo.com/Jonathan-Kamens
