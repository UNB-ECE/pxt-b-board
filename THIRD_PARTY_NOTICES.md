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

The UNBdev.board BLiXel implementation was adapted from the browser-deployed
`core/bBoardBlixel.ts`, inspected on 24 September 2026. It preserves the
deployed BLiXel command identifiers and colour conversion behavior. The shift,
rotate, zero-width bar-graph handling, UNBdev.board terminology, and tests are
UNB-ECE additions; the deployed source contains only commented placeholders
for shift and rotate.
