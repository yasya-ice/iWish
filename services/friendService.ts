import { supabase } from '@/utils/supabase';


/**
 * Otsib profiili kas kasutajanime (e-posti) järgi ja tagastab UUID.
 */
export interface UserProfile {
  id: string; // Profiili UUID
  username: string;
  avatar_url: string | null;
}
export async function searchUsersByUsername(searchTerm: string): Promise<UserProfile[]> {
  // Kui otsingutulemusi ei ole
  if (searchTerm.length === 0) return []; 

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    // TÄHELEPANU: Asendame ilike-ga (.ilike) .eq() (täpse vaste)
    .eq('username', searchTerm.toLowerCase().trim()) 
    .limit(1); // Vajame ainult ühte täpset vastet

  if (error) {
    console.error('Kasutajate otsing ebaõnnestus:', error);
    throw new Error('Otsing ebaõnnestus.');
  }

  // Kui .eq() abil midagi ei leita, on data []
  return (data || []) as UserProfile[];
}

// Sõbra ettepaneku saatmine (luuakse pending kirje)
export async function sendFriendRequest(receiverProfileId: string) {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    // TEE SEE KONTROLL TÄPSELT NII:
    if (authError || !userData?.user) {
        throw new Error("Sinu kasutaja ei ole sisse logitud või Autentimisviga.");
    }

  const userId = userData.user.id;
  const receiverId = receiverProfileId;

  const { data, error } = await supabase
    .from('friends')
    .insert([
      { 
        user_id: userId, 
        friend_id: receiverId, 
        status: 'pending' // Esialgne staatus
      },
    ]);

  if (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
  return data;
}

// Andmetüübi defineerimine paremaks tüübiks
export type Friend = {
  id: number; // friends tabeli ID (kirje eemaldamiseks)
  profile_id: string; // Sõbra UUID
  username: string; // Sõbra kasutajanimi
  relationship: string; // Näiteks 'BF', 'Granny', 'sister' (teie disaini järgi tuleb see maybe profiles tabelist või rakendusesiseselt defineerida/salvestada)
  avatar_url: string | null;
  status: 'pending' | 'accepted' | 'rejected';
};

/**
 * Toob sisse logitud kasutaja kõik sõprussuhted.
 * Tagastab listi, kus iga sõber on profiiliandmetega.
 */
export async function fetchFriendsList(): Promise<Friend[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error("Autentimine ebaõnnestus.");
  }

const senderId = userData.user.id;

  // Küsime friends tabelist kirjed, kus oleme kas user_id või friend_id
  const { data: relations, error } = await supabase
    .from('friends')
    .select(`id, status, user_id, friend_id, profiles_user_id:user_id(id,username,avatar_url), profiles_friend_id:friend_id(id,username,avatar_url)`)
    .or(`user_id.eq.${senderId},friend_id.eq.${senderId}`);

  if (error) {
    console.error('Error fetching friends list:', error);
    throw error;
  }

  // Tulemuste töötlemine ja standardiseerimine
  const friends: Friend[] = relations.map((rel: any) => {
    // Teeme kindlaks, kumb on SÕBER (vastaspool)
    const isCurrentUserInitiator = rel.user_id === senderId;
    
    // Profiilid, mis vastavad rel.user_id ja rel.friend_id (automaatselt Supabase poolt liidetud)
    const friendProfileData = isCurrentUserInitiator 
      ? rel.profiles_friend_id 
      : rel.profiles_user_id;

    // Teie disainis on "Relationship" (nt. "Granny", "BF"). 
    // See eeldab, et suhe on salvestatud kusagil, nt. profiilide tabelis, või tuleb seda käsitsi lisada.
    // Praegu kasutame 'status' + 'username' andmeid.
    const relationshipLabel = rel.status === 'pending' 
      ? 'Ootab kinnitust' 
      : (isCurrentUserInitiator ? 'Sõber (saatsin)' : 'Sõber (vastu võetud)'); // Placeholder

    return {
      id: rel.id,
      profile_id: friendProfileData.id,
      username: friendProfileData.username,
      avatar_url: friendProfileData.avatar_url,
      relationship: relationshipLabel,
      status: rel.status,
    } as Friend;
  });

  return friends;
}

/**
 * Võtame vastu sõpruse kutse
 * @param friendshipId - Kirje ID 'friends' tabelis.
 */
export async function acceptFriendRequest(friendshipId: number) {
  const { data, error } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', friendshipId) // Uuendame õiget kirjet
    .select() // See tagastab uuendatud andmed

  if (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
  return data;
}

/**
 * Eemaldab sõprussuhte (kustutab kirje 'friends' tabelist).
 * @param friendshipId - Kirje ID 'friends' tabelis.
 */
export async function removeFriend(friendshipId: number) {
  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', friendshipId);

  if (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
  // Kustutamise korral tagastame lihtsalt 'true' või 'void'
  return true; 
}

/**
 * Kustutab sõpruse (mõlemad kirjed friends tabelist) antud profiili ID alusel.
 * @param friendProfileId - Selle sõbra profiili ID, kellega sõprus lõpetatakse.
 */
export async function deleteFriendship(friendProfileId: string) {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !userData?.user) {
        throw new Error("Autentimisviga: Sinu kasutaja ID ei ole saadaval.");
    }

    const currentUserId = userData.user.id;
    const targetId = friendProfileId;

    let successfulDeletions = 0;
    // Supabase'is salvestame sõpruse kaks korda (A->B ja B->A), 
    // seega peame kustutama MÕLEMAD kirjed.

    // 1. Kustuta kirje, kus mina olen saatja ja sõber on vastuvõtja
const { error: error1 } = await supabase
        .from('friends')
        .delete()
        .match({ user_id: currentUserId, friend_id: targetId });

if (error1) {
        // Logi TÄPNE veateade ja detailid
        console.error(`[DELETE FRIEND] Viga 1 (Mina->Sõber):`, { message: error1.message, details: error1.details, hint: error1.hint, code: error1.code });
    } else {
        successfulDeletions++;
    }

    // --- PÄRING 2: Sõber -> Mina ---
    const { error: error2 } = await supabase
        .from('friends')
        .delete()
        .match({ user_id: targetId, friend_id: currentUserId });
        
    if (error2) {
        // Logi TÄPNE veateade ja detailid
        console.error(`[DELETE FRIEND] Viga 2 (Sõber->Mina):`, { message: error2.message, details: error2.details, hint: error2.hint, code: error2.code });
    } else {
        successfulDeletions++;
    }

    // Tõsta viga ainult siis, kui kumbki kustutamine ei õnnestunud
    if (successfulDeletions === 0) {
        throw new Error("Sõpruse kustutamine ebaõnnestus (RLS või andmebaasi viga). Kontrolli konsooli logisid.");
    }
}