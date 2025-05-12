export interface EntityRelation {
    property: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
    target: string;
    inverseSide?: string;
    isNullable?: boolean;
    joinColumns?: string[];
}
