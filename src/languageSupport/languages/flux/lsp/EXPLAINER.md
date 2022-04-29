# LSP connection to the monaco-editor


## Overview of Approaches
There are multiple approaches to custom language service utilization. There are (at minimum) three approaches, utilizing existing libraries:

.

1. use feature providers
    - override monaco.languages.register`<Provider>`   => connect to language service
        - https://code.visualstudio.com/api/language-extensions/programmatic-language-features 
    - this utilizes monaco-languageclient
        - example for v0.18.1: https://github.com/TypeFox/monaco-languageclient/blob/v0.18.1/examples/browser/src/client.ts
    - our current approach:
        - uses providers, but then communicates with a jsonRpc server.
            - so we use providers --> do work --> make jsonRpc --> Lsp
            - listen Lsp --> parse --> do work --> interface back to monaco
    - Pros:
        - useful when LspServer is not yet mature enough to offer needed functionality
        - ability to do variable/code expansion
    - Cons:
        - runs in main thread
        - our LspServer internally already handles many of this code work (to implement a feature)

.

2. use a dedicted, custom language worker
    - write a custom worker, and load as a dedicated worker of the monaco-editor
    - examples: 
        - https://github.com/microsoft/monaco-editor/tree/main/src/language
        - see child links: https://github.com/microsoft/monaco-editor/issues/2836
        - https://github.com/microsoft/monaco-editor/issues/1317
    - Pros:
        - runs the custom worker in another thread
        - will perform auto-mapping of interface methods between monaco-editor and our customer worker
        - ability to do code modification (e.g. variable expansion)
        - common pattern is to map the work API, to the Lsp API, per feature.
            - note: the API is not `<Provider>`. Similar, but not identical.
            - These are common set of LSP internal methods, similar to the LSP protocol.
            - LSP services often have these methods exposed. Easy mapping, less custom code.
    - Cons:
        - we cannot directly access, or postMessage to, these workers. Only monaco-editor can.
            - https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#dedicated_workers
        - our LspServer does not already expose these API methods.
            - It follows a different model, with JSON-RPC websocket communication.
            - Therefore, we would have to again re-write alot of this same logic.

.

3. use our own dedicated worker (not dedicated to monaco-editor)
    - approach:
        - monaco-editor keeps it's own `editor.worker.js`.
        - We spawn an unrelated worker under our control.
        - We carry the jsonRpc payload from: mainThread --> workerThread --> LSP (in worker thread)
    - example: https://github.com/TypeFox/monaco-languageclient/tree/v0.18.1/example
        - note: this example does not utilize another worker thread. so I had to modify.
            - basically, instead of a web socket...we have channels with the worker.
    - Pros:
        - the communication is based on jsonRpc to a listening service, without us manually re-inventing code
    - Cons:
        - still need to decide how to manually do variable expansion



