.main:                  ; this is the std library for cozyasm.
    .subr p0 include:   ; this is just a rename for import,
        import p0       ; in case you prefer, like C.
        endl            
    .subr p1 mod:       ; this function does p0 % p1 and outputs the remainder.
        ralloc 0        ;1
        dep 0           ;2 allocates the next register to &x0.
        iflt p0, p1     ;3
        nlin 4          ;4 we know that its done
        sub p0, p1, &p0 ;5      
        iflt p0, p1     ;7
        nlin 1          ;8
        llin 2          ;9
        mov &x0, p0     ;10
        depf &x0        ;11
        endl            ;12