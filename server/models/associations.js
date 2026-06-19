import InSession from "./InSession.js";
import Items from "./Items.js";
import ItemSharing from "./ItemSharing.js";



Items.hasMany(ItemSharing, {foreignKey:'itemId', as: 'sharer'});
ItemSharing.belongsTo(Items, {foreignKey:'itemId'})

ItemSharing.belongsTo(InSession, {
    foreignKey: 'userId',
    targetKey: 'userId',
    as: 'userInfo',
    constraints: false
})

export {Items, ItemSharing, InSession}