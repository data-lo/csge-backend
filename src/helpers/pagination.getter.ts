export class PagintionSetter{
    castPaginationLimit( ){
        const paginationLimit = Number(process.env.PAGINATION_LIMIT);
        return paginationLimit;
    }
    getSkipElements(page){
        const take:number = this.castPaginationLimit();
        const skip:number = (page-1)*take;
        return skip;
    }
};