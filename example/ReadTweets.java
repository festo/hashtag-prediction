import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeMap;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class ReadTweets {
	private JsonParser parser = new JsonParser();

	protected JsonObject readFromString(String str){
		if(str.length()<3) return null;
		if(!str.endsWith("}"))
			str = str.substring(0,str.lastIndexOf('}')+1);
		try {
			return parser.parse(str).getAsJsonObject();

		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	
	private void readFile(String filepath) {

		File jsonfile = new File(filepath);

		try {
			JsonElement jsonElement = parser.parse(new FileReader(jsonfile));
			JsonObject jsonObject = jsonElement.getAsJsonArray().get(0).getAsJsonObject();
			printJSON(jsonObject);
		} catch (FileNotFoundException e) {
			System.out.println(e.getMessage());
			// e.getStackTrace();
		} catch (Exception e) {
			System.out.println(e.getMessage());
			// e.getStackTrace();
		}
	}

	// read a complete json file
	private void printJSON(JsonObject jsonObject) {

		for (Entry<String,JsonElement> entry : jsonObject.entrySet()) {

			String key = entry.getKey();
			JsonElement value = entry.getValue();

			if (value.isJsonObject()) {
				System.out.println(key + ": OBJECT");
				printJSON(value.getAsJsonObject());
			} else if (value.isJsonArray()) {
				
				JsonArray jsonArray = value.getAsJsonArray();
				if (jsonArray.size() == 1) {
					System.out.println(key + ": ARRAY1");
					printJSON((JsonObject) jsonArray.get(0));
				} else {
					// prints json array name
					System.out.println(key + ": ARRAY");
					Iterator msg = jsonArray.iterator();
					while (msg.hasNext()) {
						// //prints json array values
						System.out.println(msg.next());
					}
				}
			} else {
				// //prints json object's keys and values
				System.out.println(key + " - " + value);
			}
		}
	}

	public static void main(String[] args) throws Exception {
		ReadTweets p = new ReadTweets();
		BufferedReader reader =  new BufferedReader(new InputStreamReader(new FileInputStream("yamm.json")));
		String line = null;
		int n=0; long min = Long.MAX_VALUE, max = Long.MIN_VALUE; 
		Map<String,Integer> freq = new TreeMap<>();
		PrintWriter out = new PrintWriter(new OutputStreamWriter(new FileOutputStream("hash.txt"), StandardCharsets.UTF_8));
		while((line=reader.readLine())!=null){
			JsonObject o = p.readFromString(line);
			if(o==null)continue;
			
			// magyarnyelvű a tweet?
			if(!o.get("hun").getAsBoolean()) continue;
			n++;

			// tweet szövege
			String text = o.get("text").getAsString().replace('\n', ' ').replace('\t',' ').replace('"', ' ');

			// hashtagek
			final String hashtag = "faktor";
			int tag=0;
			Iterator msg = o.get("tags").getAsJsonArray().iterator();
			while (msg.hasNext()) {
				String e=msg.next().toString();
				String bin=e.substring(1,e.length()-1);
				if(!freq.containsKey(bin))
					freq.put(bin, 1);
				else
					freq.put(bin, freq.get(bin)+1);
				if(bin.contains(hashtag)){
					tag=1;
					System.out.println(text);
				}
			}
			//out.println(tag + "\t" + text.replace("#"+hashtag, ""));
			out.println("\"" +(tag==0 ? text : text.substring(0,text.lastIndexOf('#'))) + "\"," + tag);

			// userID
			String user = o.get("user").getAsJsonObject().get("id").getAsString();
//			if(user.equals("2422014517"))
//				System.out.println(text);
			
			// post időpontja
			long date = o.get("created_at").getAsJsonObject().get("$date").getAsLong();
			min = Math.min(date, min);
			max = Math.max(date, max);
			int y = new Date(date).getYear();
			int m = new Date(date).getMonth();
			String month = Integer.toString(y+1900)+Double.toString(new Double(m+1)/100).substring(1);
			
// havi tweetszám
//			String bin=user;
//			if(!freq.containsKey(bin))
//				freq.put(bin, 1);
//			else
//				freq.put(bin, freq.get(bin)+1);
		}
		System.out.println("#tweets: "+n);
		System.out.println(new Date(min));
		System.out.println(new Date(max));

		for(String s : freq.keySet())
			if(freq.get(s)>20)
				System.out.println(s+"\t"+freq.get(s));
		System.out.println("#hashtags: "+freq.size());
		
		out.close();
	}
}
