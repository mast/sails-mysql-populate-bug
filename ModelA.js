module.exports = {

    identity: 'modela',
    tableName: 'ModelA',
    connection: 'mysql',
    migrate: 'safe',
    autoPK: false,
    autoCreatedAt: false,
    autoUpdatedAt: false,

    attributes: {

        a_id: {
            type: 'integer',
            unique: true,
            autoIncrement: true,
            primaryKey: true
        },

        name: {
            type: 'string'
        },

        // Links
        childs: {
            collection: 'ModelB',
            via: 'parent'
        }
    }
};
