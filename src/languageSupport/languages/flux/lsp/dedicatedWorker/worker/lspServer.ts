import * as worker from 'monaco-editor/esm/vs/editor/editor.worker'
import {RequestMessage} from 'vscode-languageclient'
// import {
//     Diagnostic, Command, CompletionList, CompletionItem, Hover,
//     SymbolInformation, TextEdit, FoldingRange, ColorInformation, ColorPresentation
// } from 'vscode-languageserver-types'
import {Lsp} from '@influxdata/flux-lsp-browser'
// import {Lsp, format_from_js_file} from '@influxdata/flux-lsp-browser'
// import {asAssignment} from 'src/variables/selectors'
// import {buildVarsOption} from 'src/variables/utils/buildVarsOption'
import {Variable} from 'src/types'

// FIXME/TODO:
// move `asAssignment` out of selectors (does not use redux state)

export interface JsonRpcRequest extends RequestMessage {
    params?: {
        textDocument?: {
            uri: string,
            languageId?: string,
            version?: string,
            text?: string,
        },
        contentChanges?: Object[],
        position?: any
        context?: Object,
    }
}

export interface WorkerData {
	variables: Variable[]
}

const defaultData = {
    variables: [],
}

export class LspServerManager {
    // @ts-ignore FIXME remove this once prop is used
    private _ctx: worker.IWorkerContext
    // @ts-ignore FIXME remove this once prop is used
	private _data: WorkerData
	public languageService: Lsp

	constructor(ctx: worker.IWorkerContext = {}, createData: WorkerData = defaultData) {
        this._ctx = ctx
        this._data = createData
        this.languageService = {
            free: () => {},
            send: (e) => { console.log('send default', e); return new Promise(null) },
            run: () => new Promise(null),
            onMessage: () => '',
        }
        this._startLspServer()
	}

    async _startLspServer (): Promise<Lsp> {
        console.log('async load lsp-wasm...')
        const {Lsp} = await import('@influxdata/flux-lsp-browser')
        console.log('...loaded lsp-wasm')

        this.languageService = new Lsp()

        console.log('start lspServer')
        this.languageService.run()
            .then(() => console.warn('lsp server has stopped'))
            .catch(err => console.error('lsp server has crashed', err))
        
        return this.languageService
    }

    initialize(ctx, createData: WorkerData = defaultData, src = '') {
        console.log('Launched via:', src)
        // ctx is from monaco-editor, and includes model helper methods
        this._ctx = ctx
        this._data = createData
    }

    // from https://github.com/microsoft/monaco-editor/blob/main/src/language/json/jsonWorker.ts
    getCompilationSettings(): any {
        console.log('getCompilationSettings')
		return null
	}
	getLanguageService(): any {
		console.log('getLanguageService')
		return null
	}
	getExtraLibs(): any {
		console.log('getExtraLibs')
		return null
	}
	getScriptFileNames(): string[] {
		console.log('getScriptFileNames')
		return null
	}
    getScriptVersion(): any {
		console.log('getScriptVersion')
		return null
	}
    doValidation(): any {
		console.log('doValidation')
		return null
	}
    doComplete(): any {
		console.log('doComplete')
		return null
	}
    doResolve(): any {
		console.log('doResolve')
		return null
	}
    doHover(): any {
		console.log('doHover')
		return null
	}
    format(): any {
		console.log('format')
		return null
	}
    resetSchema(): any {
		console.log('resetSchema')
		return null
	}
    findDocumentSymbols(): any {
		console.log('findDocumentSymbols')
		return null
	}
    findDocumentColors(): any {
		console.log('findDocumentColors')
		return null
	}
    getColorPresentations(): any {
		console.log('getColorPresentations')
		return null
	}
    getFoldingRanges(): any {
		console.log('getFoldingRanges')
		return null
	}

    // from stdout
    acceptNewModel(): any {
		console.log('acceptNewModel')
		return null
	}
    acceptModelChanged(): any {
		console.log('acceptModelChanged')
		return null
	}
    acceptRemovedModel(): any {
		console.log('acceptRemovedModel')
		return null
	}
    computeUnicodeHighlights(): any {
		console.log('computeUnicodeHighlights')
		return null
	}
    computeDiff(): any {
		console.log('computeDiff')
		return null
	}
    getSelectionRanges(): any {
		console.log('')
		return null
	}
}
/*
0: "constructor"
1: "dispose"
2: "_getModel"
3: "_getModels"
4: "acceptNewModel"
5: "acceptModelChanged"
6: "acceptRemovedModel"
7: "computeUnicodeHighlights"
8: "computeDiff"
9: "_modelsAreIdentical"
10: "computeMoreMinimalEdits"
11: "computeLinks"
12: "textualSuggest"
13: "computeWordRanges"
14: "navigateValueSet"
15: "loadForeignModule"
16: "fmr"
*/

let initialized = false

// used when creating a proxy
export const create = (ctx: worker.IWorkerContext, createData: WorkerData): LspServerManager => {
    if (initialized) {
        return
    }
    initialized = true
    const serviceManager = new LspServerManager()
    serviceManager.initialize(ctx, createData, 'create()')
    return serviceManager
}

self.onmessage = (e) => {
    console.log('message received in lspServer.ts', e)
}
