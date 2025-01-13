import Pkg
Pkg.add("JSON3")
using JSON3
using Base, LinearAlgebra, Random, Statistics, Dates, Core, Printf
# using REPL
# @edit Base.Docs.doc(sin)
#Base.Docs.docm(sin)
#temp = Base.Docs.doc(sin)
# Base.Docs.lookup_doc(:sin)
# REPL.Docs.lookup_doc(:sin)
# Base.Docs.getdoc(:sin)
# Base.Docs.resolve(sin)
#temp = Base.Docs.doc(Base.Docs.Binding(Base, :sin))
# Base.Docs.defined(Base.Docs.Binding(Base, :sin))
#_docstr = Base.Docs.docstr(Base.Docs.Binding(Base, :rand))
#_docstr = Base.Docs.docstr(Base.Docs.Binding(Base, :sin), Float64)
# _parsed_docstr = Base.Docs.parsedoc(_docstr)
# _parsed_docstr.content[1]


# m = Base.Docs.meta(Base.Math)
# method_binding = first(keys(m))
# m_doc = m[method_binding].docs
# first(keys(m_doc))
# keys(m)
# meth = methods(sin).ms[1]
# m_doc = m[Base.Docs.Binding(meth.module, meth.name)].docs
# m_doc[Tuple{Number}]
# meth.sig
# m_doc = m[Base.Docs.Binding(Base, :exit)].docs
# m_doc
# _docstr = Base.Docs.docstr(Base.Docs.Binding(Base.Math, :sin), Tuple{Number})
# meth.sig
# Base.unwrap_unionall(meth.sig)
# @info Base.Docs.getdoc(Base.Docs.Binding(Base.Math, :sin))
# temp = method_definition(meth)
# temp.tv
# temp.tv
# Base.Docs.signature(temp.tv)


function collect_method_docs(m::Method)
    tv, decls, file, line = Base.arg_decl_parts(m)
    sig = Base.unwrap_unionall(m.sig)
    sig = Tuple{(s for s in sig.parameters[2:end])...} # Remove method name and create tuple
    method_binding = Base.Docs.Binding(m.module, m.name)
    try
        doc1 = Base.doc(method_binding, sig)
        return doc1
    catch e
        return nothing
    end
end


# Base.doc(Base.Docs.Binding(Base, :join), :String)

# s1 = collect_method_docs(methods(open).ms[1])
# s2 = collect_method_docs(methods(open).ms[4])
# s1 == s2
# s1.content[1]
# s2.content[2]
# s.content
# collect_method_docs(methods(open).ms[end])


function escape_quotes(s::String)
    return replace(s, "\"" => "\\\"")
end

function get_module_functions(module_name)
    return fncs = filter(x -> isa(getfield(module_name, x), Function), names(module_name))
end

function list_functions(module_name)
    fcns = get_module_functions(module_name)
    for (i, fn) in pairs(fncs)
        println(fn)
        if (mod(i, 10)) == 0
            println("Press enter to continue...")
            readline()
        end
    end
end




function method_definition(@nospecialize m::Method)
    tv, decls, file, line = Base.arg_decl_parts(m)
    sig = Base.unwrap_unionall(m.sig)
    kwargs = Base.kwarg_decl(m)

    f_name = decls[1][2]  # TODO what is decls[1][1]?
    args_with_types = String[isempty(d[2]) ? d[1] : string(d[1], "::", d[2]) for d in decls[2:end]]
    arg_names = [d[1] for d in decls[2:end]]
    arg_types = [d[2] for d in decls[2:end]]

    # TODO Add types for kwargs
    kwargs = map(Base.sym_to_string, kwargs)

    # Get the docs
    doc = collect_method_docs(m)
    doc_string = doc === nothing ? "" : string(doc)

    return (
        f_name=f_name,
        args_with_types=args_with_types,
        arg_names=arg_names,
        arg_types=arg_types,
        tv=tv,
        decls=decls,
        file=file,
        line=line,
        sig=sig,
        kwargs=kwargs,
        doc=doc_string,
        module_name=string(m.module)
    )
end


# function example_method(arg1, arg2_with_type::Int, arg3_with_union::Union{Float64,Int64}, args...; kwarg1::Int, kwarg2, kwarg3::String="default", kwargs...)
#     return arg1, arg2_with_type, arg3_with_union, args, kwarg1, kwarg2, kwarg3, kwargs
# end
# example_method(1, 2, 3.0, 4, 5, 6, 1.1; kwarg1=7, kwarg2=8, kwarg3="9", kwarg4=10)
# using LinearAlgebra
# m = methods(example_method).ms[1]
# m = methods(!).ms[1]
# temp = method_definition(m)
# temp.module_name
# dump(temp)

function method_show(io::IO, m::Method; include_module::Bool=false)
    tv, decls, file, line = Base.arg_decl_parts(m)
    sig = Base.unwrap_unionall(m.sig)
    if sig === Tuple
        # Builtin
        if include_module
            print(io, m.name, "(...) in ", m.module)
        else
            print(io, m.name, "(...)")
        end
        return
    end
    print(io, decls[1][2], "(")
    join(
        io,
        String[isempty(d[2]) ? d[1] : string(d[1], "::", d[2]) for d in decls[2:end]],
        ", ",
        ", ",
    )
    kwargs = Base.kwarg_decl(m)
    if !isempty(kwargs)
        print(io, "; ")
        join(io, map(Base.sym_to_string, kwargs), ", ", ", ")
    end
    print(io, ")")
    Base.show_method_params(io, tv)

    if include_module
        print(io, " in ", m.module)
    end
end

function method_show(m::Method; include_module::Bool=false)
    io = IOBuffer()
    method_show(io, m, include_module=include_module)
    return String(take!(io))
end

function extract_functions_from_module(module_)

    public_symbols = names(module_)
    x = get_module_functions(module_)
    public_func_names = filter(x -> x in public_symbols, x)

    public_methods = map(public_func_names) do x
        ex = Expr(:., Symbol(string(module_)), QuoteNode(x))
        eval(ex)
    end

    method_table = map(public_methods) do x
        try
            methods(x, module_)
        catch e
            println("Error with method: ", x)
            return nothing
        end
    end
    method_table = filter(m -> m !== nothing, method_table)

    flat_method_table = [m for method in method_table for m in method.ms if m !== nothing]

    method_dicts = map(flat_method_table) do m
        temp = method_definition(m)
        tuple_names = (:name, :arg_names, :arg_types, :kwarg_names, :module, :doc)
        t = NamedTuple{tuple_names}((temp.f_name, temp.arg_names, temp.arg_types, temp.kwargs, temp.module_name, temp.doc))
        return t
    end




    # %% --------------------------------------------------------
    #        Print the methods to a file
    #------------------------------------------------------------


    ROOT = abspath(@__DIR__)
    output_dir = joinpath(ROOT, "API", "$(VERSION.major).$(VERSION.minor)")
    mkpath(output_dir)
    output_file = joinpath(output_dir, "$(module_).txt")
    output_file_json = joinpath(output_dir, "$(module_).json")

    open(output_file_json, "w") do io
        # TODO doesnt work in JSON ?
        #X = [escape_quotes(method_dict.name) => method_dict for method_dict in method_dicts]
        R = (
            julia=string(VERSION),
            methods=method_dicts
        )
        JSON3.pretty(io, JSON3.write(R))
    end


    method_signatures = map(flat_method_table) do m
        try
            method_show(m)
        catch e
            if isa(e, InterruptException)
                println("Interrupted")
                rethrow(e)
            end
            println("Error with method: ", m)
            return nothing
        end
    end
    filter!(x -> x !== nothing, method_signatures)
    sort!(method_signatures)

    open(output_file, "w") do io
        for sig in method_signatures
            println(io, sig)
        end
    end
end


function main()
    for m in (Base, LinearAlgebra, Random, Statistics, Dates, Printf)
        println("Extracting functions from module: ", m)
        extract_functions_from_module(m)
    end
end

main()
