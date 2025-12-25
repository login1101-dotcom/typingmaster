import os
import re

# Target Directory
DIRECTORY = "/Users/jono/Desktop/rebirth_project/typingmaster_github_clone"

# Full text privacy policy
PRIVACY_BODY_HTML = """
  <div class="content-card" style="text-align: center;">
    <h1 style="text-align: center;">プライバシーポリシー</h1>
    
    <div style="text-align: center; line-height: 1.8;">
      <h3>個人情報の利用目的</h3>
      <p>
        当サイト（タイピングマスター）では、お問い合わせや記事へのコメントの際、名前やメールアドレス等の個人情報を入力いただく場合がございます。<br>
        取得した個人情報は、お問い合わせに対する回答や必要な情報を電子メールなどをでご連絡する場合に利用させていただくものであり、これらの目的以外では利用いたしません。
      </p>

      <h3>広告について</h3>
      <p>
        当サイトでは、第三者配信の広告サービス（Googleアドセンス、A8.netなど）を利用しており、ユーザーの興味に応じた商品やサービスの広告を表示するため、クッキー（Cookie）を使用しております。<br>
        クッキーを使用することで当サイトはお客様のコンピュータを識別できるようになりますが、お客様個人を特定できるものではありません。<br>
        Cookieを無効にする方法やGoogleアドセンスに関する詳細は<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="nofollow">こちら</a>をご確認ください。
      </p>

      <h3>アクセス解析ツールについて</h3>
      <p>
        当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。<br>
        このGoogleアナリティクスはトラフィックデータの収集のためにクッキー（Cookie）を使用しております。<br>
        トラフィックデータは匿名で収集されており、個人を特定するものではありません。
      </p>
      
      <h3>免責事項</h3>
      <p>
        当サイトからのリンクやバナーなどで移動したサイトで提供される情報、サービス等について一切の責任を負いません。<br>
        また当サイトのコンテンツ・情報について、できる限り正確な情報を提供するように努めておりますが、正確性や安全性を保証するものではありません。<br>
        当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。
      </p>

      <h3>著作権について</h3>
      <p>
        当サイトで掲載している文章や画像などにつきましては、無断転載することを禁止します。<br>
        当サイトは著作権や肖像権の侵害を目的としたものではありません。著作権や肖像権に関して問題がございましたら、お問い合わせフォームよりご連絡ください。迅速に対応いたします。
      </p>

      <h3>リンクについて</h3>
      <p>
        当サイトは基本的にリンクフリーです。リンクを行う場合の許可や連絡は不要です。<br>
        ただし、インラインフレームの使用や画像の直リンクはご遠慮ください。
      </p>
    </div>

    <div class="back-link" style="margin-top: 30px;">
      <a href="index.html">TOPに戻る</a>
    </div>
  </div>
"""

# Contact Body HTML (Text Center)
CONTACT_BODY_HTML = """
  <div class="content-card" style="text-align: center;">
    <h1 style="text-align: center;">お問い合わせ</h1>
    
    <div style="text-align: center; line-height: 1.8;">
      <p class="email" style="font-weight: bold; margin-bottom: 20px;">
        ご意見・不具合報告はこちらのメールアドレスへお願いします：<br>
        <a href="mailto:toiawasetyping@via.tokyo.jp" style="font-size: 1.2em; color: #00796b;">toiawasetyping@via.tokyo.jp</a>
      </p>
      <p class="description">
        お問い合わせ内容や不具合の詳細は、上記メールアドレスまでご連絡ください。<br>
        可能な限り迅速に対応させていただきますが、内容によってはお時間をいただく場合もございます。
      </p>
    </div>

    <div class="back-link" style="margin-top: 30px;">
      <a href="index.html">TOPに戻る</a>
    </div>
  </div>
"""

def update_privacy_contact():
    # Update Privacy Policy
    privacy_path = os.path.join(DIRECTORY, "privacy.html")
    with open(privacy_path, "r", encoding="utf-8") as f:
        p_content = f.read()
    
    # Replace content inside <body>...</body> (excluding nav and script if possible, or intelligently replace container)
    # We look for <div class="content-card"...>...</div> or <div class="container"...>...</div>
    # But replacing simpler: find the H1 block or just replace main div.

    # Regex to find the main content div
    # It might be content-card or container, and it contains <h1>プライバシーポリシー</h1>
    # We replace lines 61-70 approx.
    
    # Strategy: Replace everything between the Nav end and Script Start?
    # Nav ends with </div> (comment check). Script starts with <script src="start.js">.
    # THIS IS RISKY if structure varies.
    
    # Better: regex replace the specific div containing the H1.
    regex_privacy = re.compile(r'<div class="(content-card|container)".*?>\s*<h1.*?プライバシーポリシー.*?</div>', re.DOTALL | re.IGNORECASE)
    
    if regex_privacy.search(p_content):
        new_p_content = regex_privacy.sub(PRIVACY_BODY_HTML.strip(), p_content)
        with open(privacy_path, "w", encoding="utf-8") as f:
            f.write(new_p_content)
        print("Updated privacy.html")
    else:
        print("Could not locate privacy content block to replace.")

    # Update Contact
    contact_path = os.path.join(DIRECTORY, "contact.html")
    with open(contact_path, "r", encoding="utf-8") as f:
        c_content = f.read()

    regex_contact = re.compile(r'<div class="(content-card|container)".*?>\s*<h1.*?お問い合わせ.*?</div>', re.DOTALL | re.IGNORECASE)

    if regex_contact.search(c_content):
        new_c_content = regex_contact.sub(CONTACT_BODY_HTML.strip(), c_content)
        with open(contact_path, "w", encoding="utf-8") as f:
            f.write(new_c_content)
        print("Updated contact.html")
    else:
        print("Could not locate contact content block to replace.")

if __name__ == "__main__":
    update_privacy_contact()
