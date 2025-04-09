export class PaginationSetter{
    castPaginationLimit(){
        const paginationLimit = 35;
        return paginationLimit;
    }
    getSkipElements(page:number){
        const take:number = this.castPaginationLimit();
        const skip:number = (page-1)*take;
        return skip;
    }
};