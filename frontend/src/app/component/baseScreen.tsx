function BaseScreen( { children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto min-h-screen w-100 bg-white border border-stone-300">
            {children}
        </div> 
    )
}

export default BaseScreen;
