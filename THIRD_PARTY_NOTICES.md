# Third-party notices

The initial UNBdev.board control and transport behavior was adapted from the
Brilliant Labs b.Board TypeScript source displayed by
`https://code.brilliantlabs.ca/#editor`, file `core/bBoard.ts`, inspected on
23 September 2026 at the direction of the project supervisor.

The related public repository is:

- <https://github.com/Brilliant-Labs/pxt-bboard-v2>
- branch: `Alfa`
- related source: `libs/core/bBoard.ts`
- licence file: `LICENSE.txt`

That repository distributes PXT source under this licence:

> PXT - Programming Experience Toolkit
>
> The MIT License (MIT)
>
> Copyright (c) Microsoft Corporation
>
> All rights reserved.
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

The browser-deployed source appears newer than the public `Alfa` branch. This
project records the two sources separately and does not imply that Brilliant
Labs endorses UNBdev.board.

The microphone behavior was adapted from the deployed editor's
`core/bBoardMic.ts`, inspected on 24 September 2026. The mapping retained from
that file is microphone module `7`, built-in route `0`, analog pin mask
`0x0001`, function IDs `1` through `7`, threshold event mask `8`, threshold
payload little-endian encoding, and flag clearing around event callbacks.

Intentional UNBdev.board differences are:

- namespace, enum, API, category, block, and documentation names use
  UNBdev.board terminology;
- the unused and undocumented legacy sound-level function `1` is not public;
- the deployed source's one-value `soundLevel` enum is removed because the
  event represents only a loud-sound threshold;
- implementation calls the shared `UNBdevBoard` transport and event layer;
- block IDs use an `unbdev_` prefix to avoid collisions when both extensions
  are present; and
- public documentation explicitly separates compile validation from pending
  physical microphone verification.
