function BaseScreen( { children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto h-screen w-100 bg-[#F5F5F5] border border-stone-300">
            {children}
        </div> 
    )
}

export default BaseScreen;