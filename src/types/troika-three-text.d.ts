declare module 'troika-three-text' {
  export interface TextBuilderConfig {
    useWorker?: boolean
    unicodeFontsURL?: string
  }

  export function configureTextBuilder(config: TextBuilderConfig): void
}
