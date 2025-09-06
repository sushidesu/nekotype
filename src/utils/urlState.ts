import type { AnyTransformationRule } from "../types/transformation"
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "../infrastructure/compression"

export interface AppState {
  rules: AnyTransformationRule[]
}

/**
 * 現在のURLにクエリパラメータを追加してシェア用URLを生成
 */
export async function generateShareUrl(state: AppState): Promise<string> {
  try {
    // ルールが空の場合はクエリパラメータなしのURLを返す
    if (state.rules.length === 0) {
      return window.location.origin + window.location.pathname
    }

    const jsonString = JSON.stringify(state)
    const encodedState = await compressToEncodedURIComponent(jsonString)

    if (!encodedState) {
      return window.location.origin + window.location.pathname
    }

    const url = new URL(window.location.href)
    url.searchParams.set("state", encodedState)
    return url.toString()
  } catch {
    return window.location.origin + window.location.pathname
  }
}

/**
 * 現在のURLからクエリパラメータを取得してアプリケーションの状態を復元
 */
export async function loadStateFromUrl(): Promise<AppState | null> {
  try {
    const url = new URL(window.location.href)
    const stateParam = url.searchParams.get("state")

    if (!stateParam) {
      return null
    }

    const decompressed = await decompressFromEncodedURIComponent(stateParam)

    if (!decompressed) {
      return null
    }

    const parsed: unknown = JSON.parse(decompressed)
    if (Object.hasOwn(parsed ?? {}, "rules")) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return parsed as AppState
    }

    return null
  } catch {
    return null
  }
}
