function BaseScreen( { children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white border border-stone-300">
            {children}
        </div> 
    )
}

export default BaseScreen;
