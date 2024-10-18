export class PaginationSetter{
    castPaginationLimit( ){
        const paginationLimit = 15;
        return paginationLimit;
    }
    getSkipElements(page){
        const take:number = this.castPaginationLimit();
        const skip:number = (page-1)*take;
        return skip;
    }
};