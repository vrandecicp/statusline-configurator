export interface FieldDefinition {
  id: string
  label: string
  description: string
  jqPath: string
  exampleValue: string
  category: 'model' | 'context' | 'cost' | 'workspace' | 'session' | 'advanced'
  conditional?: boolean
}
