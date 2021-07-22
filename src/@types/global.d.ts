type FunctionType = (...args: any) => any

type PromiseFnc = (...args: any) => Promise<any>

type ReturnType<T extends (...args: any[]) => any> =
    T extends (...args: any[]) => infer R ? R : never;

type ReturnTypeP<T extends (...args: any[]) => any> = ThenArg<ReturnType<T>>
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;