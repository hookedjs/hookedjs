type PromiseFnc = (...args: any) => Promise<any>

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

type ReturnType<T extends (...args: any[]) => any> =
    T extends (...args: any[]) => infer R ? R : never;

type ReturnTypeP<T extends (...args: any[]) => any> = ThenArg<ReturnType<T>>