import { useState, useRef } from "react";
import { X, Play } from "lucide-react";
import { GOLD_VINTAGE } from "../utils/constants";

// URLs de video de ejemplo
const INSTA_VIDEOS = [
    { id: 1, url: "https://instagram.feoh1-1.fna.fbcdn.net/o1/v/t2/f2/m86/AQMFcBTG5ODDH3qCy3dBGnsISkzaKfbHi-ALZReNHc2BMku0naHZkG7ylXeXckqcfiqHvah39AJwy0PMMFXyDUkbEDzkBAFp3vPGRb8.mp4?_nc_cat=110&_nc_oc=AdqYHqMj9aW1k9Um9h9HdXYakoSOWDi0M9Jcyn5tliCyHG0nW2k0b5w-NBxr4MP01kevKj9nJY4Mfq3xG4AlDS-S&_nc_sid=9ca052&_nc_ht=instagram.feoh1-1.fna.fbcdn.net&_nc_ohc=e1Nv-7wB49YQ7kNvwEqWSEC&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfYmFzZWxpbmVfMV92MSIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjoxNzkxNzA2NjAxMTMyMjQwNCwiYXNzZXRfYWdlX2RheXMiOjAsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjo0OCwiYml0cmF0ZSI6MjUzOTA2OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&_nc_gid=U413E5Pn6CH5ffHweszZjQ&_nc_ss=7a30f&_nc_zt=28&oh=00_AfwMcDgTSSZM13AtjEttSgyM9NAeZzkZb8S5cZ0nAmOGIg&oe=69BF95C7", thumb: "https://instagram.feoh1-1.fna.fbcdn.net/v/t51.82787-15/655907488_17928905763228480_7171647843387609079_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=100&ig_cache_key=Mzg1NzEzMjQwNzIzNzY1MDIyNjE3OTI4OTA1NzYwMjI4NDgw.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjExNTN4MjA0OC5zZHIuQzMifQ%3D%3D&_nc_ohc=hnDm5nAVL18Q7kNvwFLWeWL&_nc_oc=AdqxHIGiOepzSe43ABSqcahJnAenpy7YLuvBh6R3XH1WWoaRSjJXOM8O9Dres1j22lkXBknGrp4cntGVMJhrUL7_&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.feoh1-1.fna&_nc_gid=U413E5Pn6CH5ffHweszZjQ&_nc_ss=7a30f&oh=00_AfyTK9qqbvsADeR4rsxujzS7BiPrTM_H49f0094twB84tg&oe=69C39969" },
    { id: 2, url: "https://instagram.feoh3-1.fna.fbcdn.net/o1/v/t16/f2/m69/AQMeNWi2tlZpRe2eE9VNN2FsOvsjOl5dKG_p18wAK72rFolu5wJKGdiSIumILpnlcz4NALNhSBj7zlzFXvViMY27.mp4?strext=1&_nc_cat=106&_nc_oc=Ado53agy9ZXI7-z_UW4_rLSkH8WGMVWKA13r9DdzouC-HlA61B5sCetHbum80HQRzQOk62jvpsX3lzZDZEJRpjy5&_nc_sid=9ca052&_nc_ht=instagram.feoh3-1.fna.fbcdn.net&_nc_ohc=RMeh2wdpm4sQ7kNvwH00CVx&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfYmFzZWxpbmVfMV92MSIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjoxNzkxNjM3NzgwNTMyMjQwNCwiYXNzZXRfYWdlX2RheXMiOjQsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjo1OSwiYml0cmF0ZSI6MTk2NzA4OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&_nc_gid=uea8MPy3CJkJNuIilrUj8w&_nc_ss=7a30f&_nc_zt=28&oh=00_AfzGS_bBGFMABDueTRcN912x6W3LHYbyDQ_mfs5vge8FDQ&oe=69C3A6CA", thumb: "https://scontent.cdninstagram.com/v/t51.82787-15/653742322_17928288300228480_7385180479830724701_n.jpg?stp=cmp1_dst-jpg_e35_s640x640_tt6&_nc_cat=104&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=MDOsMIUUae4Q7kNvwGozVI0&_nc_oc=AdrInnDvoUynGJwB9MvW16SBTu0BrV3xES7Ldgg3ZzEpUs2DVEnl6a7ogs3IfJTMlkK4xHxwHODEgCB7LFEqUyPk&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=_wwZ8cKPn3DTVgwKLofLlg&_nc_ss=7a30f&oh=00_Afzu5Eh_skQeSL-EHvjFNgmvSbmNcEk-1TyWa9zKvlf1Eg&oe=69C37AF0" },
    { id: 3, url: "https://instagram.feoh1-1.fna.fbcdn.net/o1/v/t16/f2/m69/AQPkdTJW9m2HVXxJB_-p4EsygefQsNJUdsp0V8qEbgdD7_W0E56T2UgXm8fKSbyYVJ3zEiKo93Z187e7SpYnVaBb.mp4?strext=1&_nc_cat=101&_nc_oc=Adpmp3sPFI-6y9Cwp_LdAqpUflSH2H62_9UGjGCr4R71UqlQcuaPDo73tQG1UKwwAeLXII7CaUOLElbHeLK3CLbA&_nc_sid=9ca052&_nc_ht=instagram.feoh1-1.fna.fbcdn.net&_nc_ohc=hk3nnkUeVKIQ7kNvwHO_d9w&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfYmFzZWxpbmVfMV92MSIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjoxNzkxNDU3ODI3MDMyMjQwNCwiYXNzZXRfYWdlX2RheXMiOjExLCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6NTIsImJpdHJhdGUiOjEzMzgwOTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_gid=zOecEWkFCy8eNXjgzfLs7A&_nc_ss=7a30f&_nc_zt=28&oh=00_AfyY8s31APdQzFRFqz8ChFGwgBWaDHSOYZjuMzWzZStfow&oe=69C39243", thumb: "https://instagram.feoh3-1.fna.fbcdn.net/v/t51.71878-15/643603739_25535664659444683_8832169133347151303_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=104&ig_cache_key=Mzg0NjQxNDU5MTg5OTgxNDQ1OQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjY0MHgxMTM2LnNkci5DMyJ9&_nc_ohc=G495Y1e6CrIQ7kNvwEqbxJV&_nc_oc=AdpT4k1T7KIJbYlbfWIcfdXI63JCcODhOacdhnG7ZVVFUcC6Wz2vyzO-vQzPCrY2DMxihfzLqk-ZGwexRO_2fYK2&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.feoh3-1.fna&_nc_gid=zOecEWkFCy8eNXjgzfLs7A&_nc_ss=7a30f&oh=00_Afzw4cEKsC2r3YkzVLGR3FTylOz8Gh_L8rAT3obEEV8KeQ&oe=69C37910" },
    { id: 4, url: "https://instagram.feoh1-1.fna.fbcdn.net/o1/v/t2/f2/m86/AQMFcBTG5ODDH3qCy3dBGnsISkzaKfbHi-ALZReNHc2BMku0naHZkG7ylXeXckqcfiqHvah39AJwy0PMMFXyDUkbEDzkBAFp3vPGRb8.mp4?_nc_cat=110&_nc_oc=AdqYHqMj9aW1k9Um9h9HdXYakoSOWDi0M9Jcyn5tliCyHG0nW2k0b5w-NBxr4MP01kevKj9nJY4Mfq3xG4AlDS-S&_nc_sid=9ca052&_nc_ht=instagram.feoh1-1.fna.fbcdn.net&_nc_ohc=e1Nv-7wB49YQ7kNvwEqWSEC&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfYmFzZWxpbmVfMV92MSIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjoxNzkxNzA2NjAxMTMyMjQwNCwiYXNzZXRfYWdlX2RheXMiOjAsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjo0OCwiYml0cmF0ZSI6MjUzOTA2OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&_nc_gid=U413E5Pn6CH5ffHweszZjQ&_nc_ss=7a30f&_nc_zt=28&oh=00_AfwMcDgTSSZM13AtjEttSgyM9NAeZzkZb8S5cZ0nAmOGIg&oe=69BF95C7", thumb: "https://instagram.feoh1-1.fna.fbcdn.net/v/t51.82787-15/655907488_17928905763228480_7171647843387609079_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=100&ig_cache_key=Mzg1NzEzMjQwNzIzNzY1MDIyNjE3OTI4OTA1NzYwMjI4NDgw.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjExNTN4MjA0OC5zZHIuQzMifQ%3D%3D&_nc_ohc=hnDm5nAVL18Q7kNvwFLWeWL&_nc_oc=AdqxHIGiOepzSe43ABSqcahJnAenpy7YLuvBh6R3XH1WWoaRSjJXOM8O9Dres1j22lkXBknGrp4cntGVMJhrUL7_&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.feoh1-1.fna&_nc_gid=U413E5Pn6CH5ffHweszZjQ&_nc_ss=7a30f&oh=00_AfyTK9qqbvsADeR4rsxujzS7BiPrTM_H49f0094twB84tg&oe=69C39969" },
    { id: 5, url: "https://instagram.feoh3-1.fna.fbcdn.net/o1/v/t16/f2/m69/AQMeNWi2tlZpRe2eE9VNN2FsOvsjOl5dKG_p18wAK72rFolu5wJKGdiSIumILpnlcz4NALNhSBj7zlzFXvViMY27.mp4?strext=1&_nc_cat=106&_nc_oc=Ado53agy9ZXI7-z_UW4_rLSkH8WGMVWKA13r9DdzouC-HlA61B5sCetHbum80HQRzQOk62jvpsX3lzZDZEJRpjy5&_nc_sid=9ca052&_nc_ht=instagram.feoh3-1.fna.fbcdn.net&_nc_ohc=RMeh2wdpm4sQ7kNvwH00CVx&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfYmFzZWxpbmVfMV92MSIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjoxNzkxNjM3NzgwNTMyMjQwNCwiYXNzZXRfYWdlX2RheXMiOjQsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjo1OSwiYml0cmF0ZSI6MTk2NzA4OSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&_nc_gid=uea8MPy3CJkJNuIilrUj8w&_nc_ss=7a30f&_nc_zt=28&oh=00_AfzGS_bBGFMABDueTRcN912x6W3LHYbyDQ_mfs5vge8FDQ&oe=69C3A6CA", thumb: "https://scontent.cdninstagram.com/v/t51.82787-15/653742322_17928288300228480_7385180479830724701_n.jpg?stp=cmp1_dst-jpg_e35_s640x640_tt6&_nc_cat=104&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=MDOsMIUUae4Q7kNvwGozVI0&_nc_oc=AdrInnDvoUynGJwB9MvW16SBTu0BrV3xES7Ldgg3ZzEpUs2DVEnl6a7ogs3IfJTMlkK4xHxwHODEgCB7LFEqUyPk&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=_wwZ8cKPn3DTVgwKLofLlg&_nc_ss=7a30f&oh=00_Afzu5Eh_skQeSL-EHvjFNgmvSbmNcEk-1TyWa9zKvlf1Eg&oe=69C37AF0" },
    { id: 6, url: "https://instagram.feoh1-1.fna.fbcdn.net/o1/v/t16/f2/m69/AQPkdTJW9m2HVXxJB_-p4EsygefQsNJUdsp0V8qEbgdD7_W0E56T2UgXm8fKSbyYVJ3zEiKo93Z187e7SpYnVaBb.mp4?strext=1&_nc_cat=101&_nc_oc=Adpmp3sPFI-6y9Cwp_LdAqpUflSH2H62_9UGjGCr4R71UqlQcuaPDo73tQG1UKwwAeLXII7CaUOLElbHeLK3CLbA&_nc_sid=9ca052&_nc_ht=instagram.feoh1-1.fna.fbcdn.net&_nc_ohc=hk3nnkUeVKIQ7kNvwHO_d9w&efg=eyJ2ZW5jb2RlX3RhZyI6ImlnLXhwdmRzLmNsaXBzLmMyLUMzLmRhc2hfYmFzZWxpbmVfMV92MSIsInZpZGVvX2lkIjpudWxsLCJvaWxfdXJsZ2VuX2FwcF9pZCI6OTM2NjE5NzQzMzkyNDU5LCJjbGllbnRfbmFtZSI6ImlnIiwieHB2X2Fzc2V0X2lkIjoxNzkxNDU3ODI3MDMyMjQwNCwiYXNzZXRfYWdlX2RheXMiOjExLCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6NTIsImJpdHJhdGUiOjEzMzgwOTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&_nc_gid=zOecEWkFCy8eNXjgzfLs7A&_nc_ss=7a30f&_nc_zt=28&oh=00_AfyY8s31APdQzFRFqz8ChFGwgBWaDHSOYZjuMzWzZStfow&oe=69C39243", thumb: "https://instagram.feoh3-1.fna.fbcdn.net/v/t51.71878-15/643603739_25535664659444683_8832169133347151303_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=104&ig_cache_key=Mzg0NjQxNDU5MTg5OTgxNDQ1OQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjY0MHgxMTM2LnNkci5DMyJ9&_nc_ohc=G495Y1e6CrIQ7kNvwEqbxJV&_nc_oc=AdpT4k1T7KIJbYlbfWIcfdXI63JCcODhOacdhnG7ZVVFUcC6Wz2vyzO-vQzPCrY2DMxihfzLqk-ZGwexRO_2fYK2&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.feoh3-1.fna&_nc_gid=zOecEWkFCy8eNXjgzfLs7A&_nc_ss=7a30f&oh=00_Afzw4cEKsC2r3YkzVLGR3FTylOz8Gh_L8rAT3obEEV8KeQ&oe=69C37910" }
];

export default function InstagramCarousel() {
    const [activeVideo, setActiveVideo] = useState(null);

    return (
        <section className="insta-carousel">
            <div className="insta-carousel__header">
                <span className="label-gold" style={{ color: GOLD_VINTAGE }}>Poedagar En Acción</span>
                <h2 className="page-title">Síguenos en Instagram</h2>
                <p className="page-subtitle">@poedagar.latam</p>
                <a href="https://www.instagram.com/kinocompanysas/" target="_blank" rel="noopener noreferrer" className="btn btn--outline" style={{ marginTop: "1rem" }}>Ver Perfil Oficial</a>
            </div>

            <div className="insta-carousel__track">
                {INSTA_VIDEOS.map((item) => (
                    <InstaItem key={item.id} item={item} onClick={() => setActiveVideo(item.url)} />
                ))}
            </div>

            {/* Modal de Pantalla Completa */}
            {activeVideo && (
                <div className="insta-modal" onClick={() => setActiveVideo(null)}>
                    <button className="insta-modal__close" onClick={() => setActiveVideo(null)}>
                        <X size={32} />
                    </button>
                    <div className="insta-modal__content" onClick={(e) => e.stopPropagation()}>
                        <video 
                            src={activeVideo} 
                            controls 
                            autoPlay 
                            className="insta-modal__video"
                        />
                    </div>
                </div>
            )}
        </section>
    );
}

function InstaItem({ item, onClick }) {
    const videoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log("Play ignore"));
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0; // Reinicia el video al salir
        }
    };

    return (
        <div 
            className="insta-item" 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
        >
            <img 
                src={item.thumb} 
                alt="Instagram thumbnail" 
                className={`insta-item__thumb ${isHovered ? "insta-item__thumb--hidden" : ""}`} 
            />
            {/* El video está oculto pero pre-cargado, y se muestra y reproduce en el hover */}
            <video
                ref={videoRef}
                src={item.url}
                muted
                loop
                playsInline
                className={`insta-item__video ${isHovered ? "insta-item__video--visible" : ""}`}
            />
            <div className="insta-item__overlay">
                <Play size={32} className="insta-item__icon" />
            </div>
        </div>
    );
}
