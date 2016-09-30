module.exports = {

    identity: 'modelb',
    tableName: 'ModelB',
    connection: 'mysql',
    migrate: 'safe',
    autoPK: false,
    autoCreatedAt: false,
    autoUpdatedAt: false,

    attributes: {

        b_id: {
            type: 'integer',
            unique: true,
            autoIncrement: true,
            primaryKey: true
        },

        // This is foreign key
        a_id: {
            type: 'integer'
        },

        name: {
            type: 'string'
        },

        // Links
        parent: {
            model: 'ModelA',
            columnName: 'a_id'
        }
    }
};
